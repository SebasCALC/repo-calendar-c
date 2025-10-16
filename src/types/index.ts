export interface Event {
  id: string;
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  duration: number; // in minutes
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  seats_available: number;
  total_seats: number;
  status: 'available' | 'fully-booked' | 'cancelled';
  created_at?: string;
  updated_at?: string;
}

export interface UserProfile {
  id: string;
  username: string;
  full_name: string;
  email: string;
  phone: string;
  age: number;
  country_of_residence: string;
  city_town_name: string;
  is_admin: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface EventRegistration {
  id: string;
  user_id: string;
  event_id: string;
  seats_requested: number;
  registration_date: string;
}

export interface BookingData {
}