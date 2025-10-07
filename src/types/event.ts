export enum EventStatus {
  PLANNED = 'PLANNED',
  OPEN = 'OPEN',
  CONFIRMED = 'CONFIRMED',
}

export interface Event {
  id: string;
  title: {
    es: string;
    en: string;
  };
  description: {
    es: string;
    en: string;
  };
  date: string;
  time: string;
  location: string;
  maxSeats: number;
  availableSeats: number;
  status: EventStatus;
  providerId: string;
  providerName: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EventRegistration {
  id: string;
  eventId: string;
  userId: string;
  userName: string;
  userEmail: string;
  seatsBooked: number;
  registeredAt: string;
}
