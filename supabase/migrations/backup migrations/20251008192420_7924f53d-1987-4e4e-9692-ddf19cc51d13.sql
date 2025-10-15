-- Phase 1: Create enums and tables

-- 1. Create app_role enum
CREATE TYPE public.app_role AS ENUM ('user', 'provider', 'admin');

-- 2. Create event_status enum
CREATE TYPE public.event_status AS ENUM ('planned', 'open', 'confirmed');

-- 3. Create user_roles table (CRITICAL for security)
CREATE TABLE public.user_roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL DEFAULT 'user',
    created_at timestamptz DEFAULT now(),
    UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 4. Create profiles table
CREATE TABLE public.profiles (
    id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name text NOT NULL,
    email text NOT NULL,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 5. Create events table
CREATE TABLE public.events (
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
    status event_status NOT NULL DEFAULT 'planned',
    provider_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    provider_name text NOT NULL,
    image_url text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- 6. Create event_registrations table
CREATE TABLE public.event_registrations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id uuid REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    user_name text NOT NULL,
    user_email text NOT NULL,
    seats_booked integer NOT NULL CHECK (seats_booked > 0 AND seats_booked <= 4),
    registered_at timestamptz DEFAULT now(),
    UNIQUE (event_id, user_id)
);

ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;

-- Phase 2: Create security definer function
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Phase 3: Create trigger for new users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert into profiles
  INSERT INTO public.profiles (id, name, email)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'name', 'User'),
    new.email
  );
  
  -- Assign USER role by default
  INSERT INTO public.user_roles (user_id, role)
  VALUES (new.id, 'user');
  
  RETURN new;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Phase 4: RLS Policies for profiles
CREATE POLICY "Profiles are viewable by everyone"
ON public.profiles FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Phase 5: RLS Policies for user_roles
CREATE POLICY "Roles are viewable by everyone"
ON public.user_roles FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Only admins can manage roles"
ON public.user_roles FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Phase 6: RLS Policies for events
CREATE POLICY "Events are publicly viewable"
ON public.events FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Providers can create events"
ON public.events FOR INSERT
TO authenticated
WITH CHECK (
  public.has_role(auth.uid(), 'provider') 
  AND provider_id = auth.uid()
);

CREATE POLICY "Admins can create events"
ON public.events FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Providers can update own events"
ON public.events FOR UPDATE
TO authenticated
USING (
  public.has_role(auth.uid(), 'provider') 
  AND provider_id = auth.uid()
)
WITH CHECK (
  public.has_role(auth.uid(), 'provider') 
  AND provider_id = auth.uid()
);

CREATE POLICY "Admins can update all events"
ON public.events FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Providers can delete own events"
ON public.events FOR DELETE
TO authenticated
USING (
  public.has_role(auth.uid(), 'provider') 
  AND provider_id = auth.uid()
);

CREATE POLICY "Admins can delete all events"
ON public.events FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Phase 7: RLS Policies for event_registrations
CREATE POLICY "Users can view own registrations"
ON public.event_registrations FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Providers can view event registrations"
ON public.event_registrations FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'provider')
  AND event_id IN (
    SELECT id FROM public.events WHERE provider_id = auth.uid()
  )
);

CREATE POLICY "Admins can view all registrations"
ON public.event_registrations FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can register for events"
ON public.event_registrations FOR INSERT
TO authenticated
WITH CHECK (
  public.has_role(auth.uid(), 'user')
  AND user_id = auth.uid()
  AND seats_booked <= 4
);

CREATE POLICY "Users can cancel own registrations"
ON public.event_registrations FOR DELETE
TO authenticated
USING (user_id = auth.uid());