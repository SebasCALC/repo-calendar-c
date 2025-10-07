import { Event, EventStatus } from '@/types/event';

const STORAGE_KEY = 'events';

export const getEvents = (): Event[] => {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const saveEvents = (events: Event[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
};

export const addEvent = (event: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>): Event => {
  const events = getEvents();
  const newEvent: Event = {
    ...event,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  events.push(newEvent);
  saveEvents(events);
  return newEvent;
};

export const updateEvent = (id: string, updates: Partial<Event>): Event | null => {
  const events = getEvents();
  const index = events.findIndex(e => e.id === id);
  
  if (index === -1) return null;
  
  events[index] = {
    ...events[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  
  saveEvents(events);
  return events[index];
};

export const deleteEvent = (id: string): boolean => {
  const events = getEvents();
  const filtered = events.filter(e => e.id !== id);
  
  if (filtered.length === events.length) return false;
  
  saveEvents(filtered);
  
  // Also delete associated registrations
  const registrations = JSON.parse(localStorage.getItem('registrations') || '[]');
  const filteredRegistrations = registrations.filter((r: any) => r.eventId !== id);
  localStorage.setItem('registrations', JSON.stringify(filteredRegistrations));
  
  return true;
};

export const getEventById = (id: string): Event | null => {
  const events = getEvents();
  return events.find(e => e.id === id) || null;
};

export const getEventsByProvider = (providerId: string): Event[] => {
  const events = getEvents();
  return events.filter(e => e.providerId === providerId);
};

export const getEventsByStatus = (status: EventStatus): Event[] => {
  const events = getEvents();
  return events.filter(e => e.status === status);
};

export const getEventsByDateRange = (startDate: string, endDate: string): Event[] => {
  const events = getEvents();
  return events.filter(e => e.date >= startDate && e.date <= endDate);
};
