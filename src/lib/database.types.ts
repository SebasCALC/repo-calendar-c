export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          name: string;
          email: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          name: string;
          email: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      user_roles: {
        Row: {
          id: string;
          user_id: string;
          role: 'user' | 'provider' | 'admin';
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          role?: 'user' | 'provider' | 'admin';
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          role?: 'user' | 'provider' | 'admin';
          created_at?: string;
        };
      };
      events: {
        Row: {
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
          status: 'planned' | 'open' | 'confirmed' | 'canceled' | 'successful';
          provider_id: string;
          provider_name: string;
          image_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title_es: string;
          title_en: string;
          description_es: string;
          description_en: string;
          date: string;
          time: string;
          location: string;
          max_seats: number;
          available_seats: number;
          status?: 'planned' | 'open' | 'confirmed' | 'canceled' | 'successful';
          provider_id: string;
          provider_name: string;
          image_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title_es?: string;
          title_en?: string;
          description_es?: string;
          description_en?: string;
          date?: string;
          time?: string;
          location?: string;
          max_seats?: number;
          available_seats?: number;
          status?: 'planned' | 'open' | 'confirmed' | 'canceled' | 'successful';
          provider_id?: string;
          provider_name?: string;
          image_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      event_registrations: {
        Row: {
          id: string;
          event_id: string;
          user_id: string;
          user_name: string;
          user_email: string;
          seats_booked: number;
          registered_at: string;
        };
        Insert: {
          id?: string;
          event_id: string;
          user_id: string;
          user_name: string;
          user_email: string;
          seats_booked: number;
          registered_at?: string;
        };
        Update: {
          id?: string;
          event_id?: string;
          user_id?: string;
          user_name?: string;
          user_email?: string;
          seats_booked?: number;
          registered_at?: string;
        };
      };
    };
    Enums: {
      app_role: 'user' | 'provider' | 'admin';
      event_status: 'planned' | 'open' | 'confirmed' | 'canceled' | 'successful';
    };
  };
}