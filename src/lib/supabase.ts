import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';
import { UserProfile, AppRole } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Auth helper functions
export const signUp = async (email: string, password: string, userData: {
  name: string;
}) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name: userData.name
      }
    }
  });

  if (error) throw error;
  return data;
};

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

export const getUserProfile = async (userId: string): Promise<UserProfile> => {
  // Get profile data
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (profileError) throw profileError;

  // Get user role
  const { data: roleData, error: roleError } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)
    .single();

  if (roleError) throw roleError;

  return {
    ...profile,
    role: roleData.role as AppRole
  };
};

export const updateUserProfile = async (userId: string, profileData: {
  name?: string;
  email?: string;
}) => {
  const { data, error } = await supabase
    .from('profiles')
    .update({
      ...profileData,
      updated_at: new Date().toISOString()
    })
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateUserRole = async (userId: string, newRole: AppRole) => {
  // First, delete existing role
  await supabase
    .from('user_roles')
    .delete()
    .eq('user_id', userId);

  // Then insert new role
  const { data, error } = await supabase
    .from('user_roles')
    .insert({
      user_id: userId,
      role: newRole
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateUserPassword = async (newPassword: string) => {
  const { data, error } = await supabase.auth.updateUser({
    password: newPassword
  });

  if (error) throw error;
  return data;
};