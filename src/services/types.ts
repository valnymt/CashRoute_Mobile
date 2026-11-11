// Shape of the API surface — matches the portal's services/types.ts.
// Lets us swap between mockApi and (future) httpApi without changing callers.

import type { TripData, NotificationData, HistoryTrip } from '../types';

export interface Api {
  auth: {
    login: (username: string, password: string) => Promise<{ token: string }>;
    logout: () => Promise<void>;
  };
  trips: {
    current: () => Promise<TripData | null>;
    upcoming: () => Promise<TripData | null>;
    history: () => Promise<HistoryTrip[]>;
  };
  otp: {
    request: (tripId: string, stage: 'pickup' | 'dropOff') => Promise<void>;
    verify: (tripId: string, code: string, stage: 'pickup' | 'dropOff') => Promise<void>;
  };
  notifications: {
    list: () => Promise<NotificationData[]>;
    markRead: (id: string) => Promise<void>;
  };
}
