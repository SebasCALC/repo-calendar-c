export type AppRole = 'user' | 'provider' | 'admin';

export type EventStatus = 'planned' | 'open' | 'confirmed' | 'canceled' | 'successful';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: AppRole;
  created_at?: string;
  updated_at?: string;
}

export interface Event {
  id: string;
  title_es: string;
  title_en: string;
  description_es: string;
  description_en: string;
  date: string;
  time: string;
  location: string;
  max_seats: number;
  available_seats: number;
  status: EventStatus;
  provider_id: string;
  provider_name: string;
  image_url?: string;
  created_at?: string;
  updated_at?: string;
}

export interface EventRegistration {
  id: string;
  event_id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  seats_booked: number;
  registered_at: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
  created_at: string;
}