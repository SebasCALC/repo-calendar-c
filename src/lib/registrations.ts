import { EventRegistration, EventStatus } from '@/types/event';
import { UserRole } from '@/types/user';
import { getEventById, updateEvent } from './mockData';

const STORAGE_KEY = 'registrations';

export const getRegistrations = (): EventRegistration[] => {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
};

const saveRegistrations = (registrations: EventRegistration[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(registrations));
};

export const canRegisterForEvent = (
  eventId: string,
  userId: string,
  userRole: UserRole,
  seatsRequested: number
): { canRegister: boolean; reason?: string } => {
  const event = getEventById(eventId);
  
  if (!event) {
    return { canRegister: false, reason: 'Event not found' };
  }

  // Check event status
  if (event.status !== EventStatus.OPEN && event.status !== EventStatus.CONFIRMED) {
    return { canRegister: false, reason: 'Event is not open for registration' };
  }

  // Check user role - only USER role can register
  if (userRole !== UserRole.USER) {
    return { canRegister: false, reason: 'Only regular users can register for events' };
  }

  // Check seat availability
  if (event.availableSeats < seatsRequested) {
    return { canRegister: false, reason: 'Not enough seats available' };
  }

  // Check user's current bookings for this event
  const registrations = getRegistrations();
  const userRegistration = registrations.find(
    r => r.eventId === eventId && r.userId === userId
  );

  if (userRegistration) {
    const totalSeats = userRegistration.seatsBooked + seatsRequested;
    if (totalSeats > 4) {
      return { canRegister: false, reason: 'Maximum 4 seats per user per event' };
    }
  } else if (seatsRequested > 4) {
    return { canRegister: false, reason: 'Maximum 4 seats per user per event' };
  }

  return { canRegister: true };
};

export const registerForEvent = (
  eventId: string,
  userId: string,
  userName: string,
  userEmail: string,
  userRole: UserRole,
  seatsRequested: number = 1
): { success: boolean; message: string; registration?: EventRegistration } => {
  const validation = canRegisterForEvent(eventId, userId, userRole, seatsRequested);
  
  if (!validation.canRegister) {
    return { success: false, message: validation.reason || 'Cannot register' };
  }

  const registrations = getRegistrations();
  const existingRegistration = registrations.find(
    r => r.eventId === eventId && r.userId === userId
  );

  let registration: EventRegistration;

  if (existingRegistration) {
    // Update existing registration
    existingRegistration.seatsBooked += seatsRequested;
    registration = existingRegistration;
  } else {
    // Create new registration
    registration = {
      id: crypto.randomUUID(),
      eventId,
      userId,
      userName,
      userEmail,
      seatsBooked: seatsRequested,
      registeredAt: new Date().toISOString(),
    };
    registrations.push(registration);
  }

  saveRegistrations(registrations);

  // Update event available seats
  const event = getEventById(eventId);
  if (event) {
    updateEvent(eventId, {
      availableSeats: event.availableSeats - seatsRequested,
    });
  }

  return { success: true, message: 'Registration successful', registration };
};

export const cancelRegistration = (
  eventId: string,
  userId: string
): { success: boolean; message: string } => {
  const registrations = getRegistrations();
  const registration = registrations.find(
    r => r.eventId === eventId && r.userId === userId
  );

  if (!registration) {
    return { success: false, message: 'Registration not found' };
  }

  // Remove registration
  const filtered = registrations.filter(
    r => !(r.eventId === eventId && r.userId === userId)
  );
  saveRegistrations(filtered);

  // Restore event available seats
  const event = getEventById(eventId);
  if (event) {
    updateEvent(eventId, {
      availableSeats: event.availableSeats + registration.seatsBooked,
    });
  }

  return { success: true, message: 'Registration cancelled successfully' };
};

export const getUserRegistrations = (userId: string): EventRegistration[] => {
  const registrations = getRegistrations();
  return registrations.filter(r => r.userId === userId);
};

export const getEventRegistrations = (eventId: string): EventRegistration[] => {
  const registrations = getRegistrations();
  return registrations.filter(r => r.eventId === eventId);
};

export const getRegistrationStats = () => {
  const registrations = getRegistrations();
  return {
    total: registrations.length,
    totalSeats: registrations.reduce((sum, r) => sum + r.seatsBooked, 0),
  };
};
