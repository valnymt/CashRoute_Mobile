import React, { createContext, useContext, useState, useCallback } from 'react';
import {
  CURRENT_TRIP,
  UPCOMING_TRIP,
  NOTIFICATIONS,
  TRIP_HISTORY,
} from '../data/mockData';
import type { TripData, NotificationData, HistoryTrip } from '../data/mockData';

type TripStage =
  | 'assigned'
  | 'pickupEnRoute'
  | 'pickupArrived'
  | 'pickupVerified'
  | 'dropOffEnRoute'
  | 'dropOffArrived'
  | 'dropOffVerified'
  | 'proofSubmitted'
  | 'completed';

interface AppState {
  user: { name: string; initials: string; team: string; role: string };
  currentTrip: TripData;
  upcomingTrip: TripData;
  tripStage: TripStage;
  notifications: NotificationData[];
  unreadCount: number;
  tripHistory: HistoryTrip[];
  isRefreshing: boolean;

  advanceStage: () => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  refreshData: () => Promise<void>;
  resetTrip: () => void;
}

const AppContext = createContext<AppState | null>(null);

const STAGE_ORDER: TripStage[] = [
  'assigned',
  'pickupEnRoute',
  'pickupArrived',
  'pickupVerified',
  'dropOffEnRoute',
  'dropOffArrived',
  'dropOffVerified',
  'proofSubmitted',
  'completed',
];

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tripStage, setTripStage] = useState<TripStage>('assigned');
  const [notifications, setNotifications] = useState(NOTIFICATIONS);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const user = {
    name: 'Ngeyeemon',
    initials: 'NYM',
    team: 'Team A',
    role: 'Driver',
  };

  const unreadCount = notifications.filter(n => n.isNew).length;

  const advanceStage = useCallback(() => {
    setTripStage(prev => {
      const idx = STAGE_ORDER.indexOf(prev);
      if (idx < STAGE_ORDER.length - 1) {
        return STAGE_ORDER[idx + 1];
      }
      return prev;
    });
  }, []);

  const markNotificationRead = useCallback((id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, isNew: false } : n)),
    );
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, isNew: false })));
  }, []);

  const refreshData = useCallback(async () => {
    setIsRefreshing(true);
    await new Promise<void>(resolve => setTimeout(resolve, 1200));
    setIsRefreshing(false);
  }, []);

  const resetTrip = useCallback(() => {
    setTripStage('assigned');
  }, []);

  return (
    <AppContext.Provider
      value={{
        user,
        currentTrip: CURRENT_TRIP,
        upcomingTrip: UPCOMING_TRIP,
        tripStage,
        notifications,
        unreadCount,
        tripHistory: TRIP_HISTORY,
        isRefreshing,
        advanceStage,
        markNotificationRead,
        markAllNotificationsRead,
        refreshData,
        resetTrip,
      }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppState => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be inside AppProvider');
  return ctx;
};
