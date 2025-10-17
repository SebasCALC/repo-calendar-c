export interface Database {
  public: {
    Tables: {
      events: {
        Row: {
          id: string;
          title: string;
          description: string;
          start_time: string;
          end_time: string;
          duration: number;
          difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
          seats_available: number;
          total_seats: number;
          status: 'available' | 'fully-booked' | 'cancelled';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description: string;
          start_time: string;
          end_time: string;
          duration: number;
          difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
          seats_available: number;
          total_seats: number;
          status?: 'available' | 'fully-booked' | 'cancelled';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          start_time?: string;
          end_time?: string;
          duration?: number;
          difficulty?: 'Beginner' | 'Intermediate' | 'Advanced';
          seats_available?: number;
          total_seats?: number;
          status?: 'available' | 'fully-booked' | 'cancelled';
          created_at?: string;
          updated_at?: string;
        };
      };
      user_profiles: {
        Row: {
          id: string;
          username: string;
          full_name: string;
          email: string;
          phone: string;
          age: number;
          country_of_residence: string;
          city_town_name: string;
          is_admin: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username: string;
          full_name: string;
          email: string;
          phone: string;
          age: number;
          country_of_residence: string;
          city_town_name: string;
          is_admin?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
          full_name?: string;
          email?: string;
          phone?: string;
          age?: number;
          country_of_residence?: string;
          city_town_name?: string;
          is_admin?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      event_registrations: {
        Row: {
          id: string;
          user_id: string;
          event_id: string;
          seats_requested: number;
          registration_date: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          event_id: string;
          seats_requested: number;
          registration_date?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          event_id?: string;
          seats_requested?: number;
          registration_date?: string;
        };
      };
    };
  };
}