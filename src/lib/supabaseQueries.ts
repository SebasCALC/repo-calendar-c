import { supabase } from "@/integrations/supabase/client";
import { Event, EventStatus } from "@/types/event";

export const getEvents = async (): Promise<Event[]> => {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .order('date', { ascending: true });

  if (error) throw error;
  
  return (data || []).map(event => ({
    id: event.id,
    title: {
      es: event.title_es,
      en: event.title_en
    },
    description: {
      es: event.description_es,
      en: event.description_en
    },
    date: event.date,
    time: event.time,
    location: event.location,
    maxSeats: event.max_seats,
    availableSeats: event.available_seats,
    status: event.status as EventStatus,
    providerId: event.provider_id,
    providerName: event.provider_name,
    imageUrl: event.image_url,
    createdAt: event.created_at,
    updatedAt: event.updated_at
  }));
};

export const getEventById = async (id: string): Promise<Event | null> => {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  return {
    id: data.id,
    title: {
      es: data.title_es,
      en: data.title_en
    },
    description: {
      es: data.description_es,
      en: data.description_en
    },
    date: data.date,
    time: data.time,
    location: data.location,
    maxSeats: data.max_seats,
    availableSeats: data.available_seats,
    status: data.status as EventStatus,
    providerId: data.provider_id,
    providerName: data.provider_name,
    imageUrl: data.image_url,
    createdAt: data.created_at,
    updatedAt: data.updated_at
  };
};

export const getEventsByProvider = async (providerId: string): Promise<Event[]> => {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('provider_id', providerId)
    .order('date', { ascending: true });

  if (error) throw error;

  return (data || []).map(event => ({
    id: event.id,
    title: {
      es: event.title_es,
      en: event.title_en
    },
    description: {
      es: event.description_es,
      en: event.description_en
    },
    date: event.date,
    time: event.time,
    location: event.location,
    maxSeats: event.max_seats,
    availableSeats: event.available_seats,
    status: event.status as EventStatus,
    providerId: event.provider_id,
    providerName: event.provider_name,
    imageUrl: event.image_url,
    createdAt: event.created_at,
    updatedAt: event.updated_at
  }));
};

export const addEvent = async (eventData: Partial<Event>): Promise<Event> => {
  const { data, error } = await supabase
    .from('events')
    .insert([{
      title_es: eventData.title?.es || '',
      title_en: eventData.title?.en || '',
      description_es: eventData.description?.es || '',
      description_en: eventData.description?.en || '',
      date: eventData.date,
      time: eventData.time,
      location: eventData.location,
      max_seats: eventData.maxSeats,
      available_seats: eventData.availableSeats,
      status: eventData.status || EventStatus.PLANNED,
      provider_id: eventData.providerId,
      provider_name: eventData.providerName,
      image_url: eventData.imageUrl
    }] as any)
    .select()
    .single();

  if (error) throw error;

  return {
    id: data.id,
    title: {
      es: data.title_es,
      en: data.title_en
    },
    description: {
      es: data.description_es,
      en: data.description_en
    },
    date: data.date,
    time: data.time,
    location: data.location,
    maxSeats: data.max_seats,
    availableSeats: data.available_seats,
    status: data.status as EventStatus,
    providerId: data.provider_id,
    providerName: data.provider_name,
    imageUrl: data.image_url,
    createdAt: data.created_at,
    updatedAt: data.updated_at
  };
};

export const updateEvent = async (id: string, updates: Partial<Event>): Promise<Event> => {
  const updateData: any = {
    updated_at: new Date().toISOString()
  };

  if (updates.title) {
    updateData.title_es = updates.title.es;
    updateData.title_en = updates.title.en;
  }
  if (updates.description) {
    updateData.description_es = updates.description.es;
    updateData.description_en = updates.description.en;
  }
  if (updates.date !== undefined) updateData.date = updates.date;
  if (updates.time !== undefined) updateData.time = updates.time;
  if (updates.location !== undefined) updateData.location = updates.location;
  if (updates.maxSeats !== undefined) updateData.max_seats = updates.maxSeats;
  if (updates.availableSeats !== undefined) updateData.available_seats = updates.availableSeats;
  if (updates.status !== undefined) updateData.status = updates.status;
  if (updates.imageUrl !== undefined) updateData.image_url = updates.imageUrl;

  const { data, error } = await supabase
    .from('events')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;

  return {
    id: data.id,
    title: {
      es: data.title_es,
      en: data.title_en
    },
    description: {
      es: data.description_es,
      en: data.description_en
    },
    date: data.date,
    time: data.time,
    location: data.location,
    maxSeats: data.max_seats,
    availableSeats: data.available_seats,
    status: data.status as EventStatus,
    providerId: data.provider_id,
    providerName: data.provider_name,
    imageUrl: data.image_url,
    createdAt: data.created_at,
    updatedAt: data.updated_at
  };
};

export const deleteEvent = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('events')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

export const getUserRegistrations = async (userId: string) => {
  const { data, error } = await supabase
    .from('event_registrations')
    .select(`
      *,
      events (*)
    `)
    .eq('user_id', userId);

  if (error) throw error;
  return data || [];
};

export const getEventRegistrations = async (eventId: string) => {
  const { data, error } = await supabase
    .from('event_registrations')
    .select('*')
    .eq('event_id', eventId);

  if (error) throw error;
  return data || [];
};

export const registerForEvent = async (
  eventId: string,
  userId: string,
  userName: string,
  userEmail: string,
  seatsBooked: number
): Promise<void> => {
  // Start a transaction-like operation
  const { data: event, error: fetchError } = await supabase
    .from('events')
    .select('available_seats')
    .eq('id', eventId)
    .single();

  if (fetchError) throw fetchError;
  if (!event || event.available_seats < seatsBooked) {
    throw new Error('Not enough seats available');
  }

  // Insert registration
  const { error: insertError } = await supabase
    .from('event_registrations')
    .insert({
      event_id: eventId,
      user_id: userId,
      user_name: userName,
      user_email: userEmail,
      seats_booked: seatsBooked
    });

  if (insertError) throw insertError;

  // Update available seats
  const { error: updateError } = await supabase
    .from('events')
    .update({ available_seats: event.available_seats - seatsBooked })
    .eq('id', eventId);

  if (updateError) throw updateError;
};

export const cancelRegistration = async (eventId: string, userId: string): Promise<void> => {
  // Get the registration to know how many seats to free
  const { data: registration, error: fetchError } = await supabase
    .from('event_registrations')
    .select('seats_booked')
    .eq('event_id', eventId)
    .eq('user_id', userId)
    .single();

  if (fetchError) throw fetchError;
  if (!registration) throw new Error('Registration not found');

  // Delete registration
  const { error: deleteError } = await supabase
    .from('event_registrations')
    .delete()
    .eq('event_id', eventId)
    .eq('user_id', userId);

  if (deleteError) throw deleteError;

  // Update available seats
  const { data: event, error: eventError } = await supabase
    .from('events')
    .select('available_seats')
    .eq('id', eventId)
    .single();

  if (eventError) throw eventError;

  const { error: updateError } = await supabase
    .from('events')
    .update({ available_seats: event.available_seats + registration.seats_booked })
    .eq('id', eventId);

  if (updateError) throw updateError;
};
