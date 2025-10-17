/*
  # Complete Database Schema Recreation

  This migration creates the entire database schema from scratch with the new requirements:

  1. New Enums
     - `app_role` enum with values: 'user', 'provider', 'admin'
     - `event_status` enum with values: 'planned', 'open', 'confirmed', 'canceled', 'successful'

  2. New Tables
     - `profiles` - User profile information (without is_admin)
     - `user_roles` - User role assignments
     - `events` - Event details with new status workflow
     - `event_registrations` - Event registration tracking

  3. Security
     - Enable RLS on all tables
     - Add comprehensive policies for role-based access
     - Create security definer functions for role checking

  4. Triggers
     - Auto-create profile and assign default role on user signup
*/

-- Create custom types
CREATE TYPE public.app_role AS ENUM ('user', 'provider', 'admin');
CREATE TYPE public.event_status AS ENUM ('planned', 'open', 'confirmed', 'canceled', 'successful');

-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create user_roles table
CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL DEFAULT 'user',
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Create events table
CREATE TABLE IF NOT EXISTS public.events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title_es text NOT NULL,
  title_en text NOT NULL,
  description_es text NOT NULL,
  description_en text NOT NULL,
  date date NOT NULL,
  time time NOT NULL,
  location text NOT NULL,
  max_seats integer NOT NULL CHECK (max_seats > 0),
  available_seats integer NOT NULL CHECK (available_seats >= 0),
  status public.event_status NOT NULL DEFAULT 'planned',
  provider_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider_name text NOT NULL,
  image_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create event_registrations table
CREATE TABLE IF NOT EXISTS public.event_registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_name text NOT NULL,
  user_email text NOT NULL,
  seats_booked integer NOT NULL CHECK (seats_booked > 0 AND seats_booked <= 4),
  registered_at timestamptz DEFAULT now(),
  UNIQUE(event_id, user_id)
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check user roles
CREATE OR REPLACE FUNCTION public.has_role(user_id uuid, check_role public.app_role)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = has_role.user_id
    AND user_roles.role = check_role
  );
END;
$$;

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Insert into profiles
  INSERT INTO public.profiles (id, name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    NEW.email
  );
  
  -- Assign default user role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$;

-- Create trigger for new user registration
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- RLS Policies for profiles table
CREATE POLICY "Users can view own profile"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for user_roles table
CREATE POLICY "Users can view own roles"
  ON public.user_roles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
  ON public.user_roles
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage all roles"
  ON public.user_roles
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for events table
CREATE POLICY "Everyone can view events"
  ON public.events
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Providers can create events"
  ON public.events
  FOR INSERT
  TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'provider') OR 
    public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Providers can update own events"
  ON public.events
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = provider_id AND 
    (public.has_role(auth.uid(), 'provider') OR public.has_role(auth.uid(), 'admin'))
  );

CREATE POLICY "Admins can update all events"
  ON public.events
  FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete events"
  ON public.events
  FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for event_registrations table
CREATE POLICY "Users can view own registrations"
  ON public.event_registrations
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Event providers can view registrations for their events"
  ON public.event_registrations
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.events
      WHERE events.id = event_registrations.event_id
      AND events.provider_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all registrations"
  ON public.event_registrations
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can register for events"
  ON public.event_registrations
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM public.events
      WHERE events.id = event_registrations.event_id
      AND events.status IN ('open', 'confirmed')
    )
  );

CREATE POLICY "Users can update own registrations"
  ON public.event_registrations
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can cancel own registrations"
  ON public.event_registrations
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all registrations"
  ON public.event_registrations
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));