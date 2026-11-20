import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from 'react';

import { NOTIFICATIONS } from '../services/mockData';
import { getTripHistory } from '../services/tripHistory';
import {
  getMessaging,
  onMessage,
} from '@react-native-firebase/messaging';

import { getMyAssignments } from '../services/assignment';

import type {
  TripData,
  NotificationData,
  HistoryTrip,
  TripStage,
  User,
  TeamMember,
} from '../types';

import type { BackendAssignment } from '../services/assignment';

interface AppState {
  user: User;
  currentTrip: TripData | null;
  upcomingTrip: TripData | null;
  tripStage: TripStage;
  notifications: NotificationData[];
  unreadCount: number;
  tripHistory: HistoryTrip[];
  teamMembers: TeamMember[];
  isRefreshing: boolean;
  assignmentError: string | null;

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

function mapAssignmentToTrip(item: BackendAssignment): TripData {
  const status =
    item.status.toLowerCase() === 'in_transit'
      ? 'In Transit'
      : item.status.toLowerCase() === 'completed'
        ? 'Completed'
        : 'Assigned';

  return {
    id: item.reference,

    // Numeric IDs are needed by the OTP backend.
    cashRequestId: item.cash_request_id,
    tripId: item.trip_id,

    type: item.type,
    amount: Number(item.amount).toLocaleString('en-US'),
    currency: item.currency,

    pickupName: item.pickup.name,
    pickupAddr: item.pickup.address,
    pickupLatitude: item.pickup.latitude,
    pickupLongitude: item.pickup.longitude,

    dropOffName: item.dropoff.name,
    dropOffAddr: item.dropoff.address,
    dropOffLatitude: item.dropoff.latitude,
    dropOffLongitude: item.dropoff.longitude,

    contactName: item.pickup.contact_name || '',
    contactInfo: item.pickup.contact_phone || '',
    pickupContactPhone: item.pickup.contact_phone || '',

    dropOffContact: item.dropoff.contact_name || '',
    dropOffContactInfo: item.dropoff.contact_phone || '',
    dropOffContactPhone: item.dropoff.contact_phone || '',

    remarks: item.remarks || '',
    timeSlot: '',
    status,
    date: item.date,
    team: `Team ${item.team_id}`,
  };
}

function mapTeamMembers(item: BackendAssignment): TeamMember[] {
  return item.team?.members.map(member => ({
    name: member.name,
    initials: member.name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase(),
    role: member.role || 'Team Member',
    phone: member.phone || '',
  })) ?? [];
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [tripStage, setTripStage] = useState<TripStage>('assigned');
  const [notifications, setNotifications] = useState(NOTIFICATIONS);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [currentTrip, setCurrentTrip] = useState<TripData | null>(null);
  const [tripHistory, setTripHistory] = useState<HistoryTrip[]>([]);
  const [assignmentError, setAssignmentError] = useState<string | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);

  const user: User = {
    name: 'Ngeyeemon',
    initials: 'NYM',
    team: 'Team A',
    role: 'Driver',
  };

  const unreadCount = notifications.filter(n => n.isNew).length;

  const advanceStage = useCallback(() => {
    setTripStage(prev => {
      const idx = STAGE_ORDER.indexOf(prev);
      return idx < STAGE_ORDER.length - 1
        ? STAGE_ORDER[idx + 1]
        : prev;
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
    setAssignmentError(null);

    const [assignmentResult, historyResult] = await Promise.allSettled([
      getMyAssignments(),
      getTripHistory(),
    ]);

    // Handle assignments
    if (assignmentResult.status === 'fulfilled') {
      const assignments = assignmentResult.value;

      const activeAssignments = assignments.filter(item =>
        ['assigned', 'reassigned', 'in_transit'].includes(
          item.status.toLowerCase(),
        ),
      );

      if (activeAssignments.length > 0) {
        const assignment = activeAssignments[0];

        setCurrentTrip(mapAssignmentToTrip(assignment));
        setTeamMembers(mapTeamMembers(assignment));
      } else {
        setCurrentTrip(null);
        setTeamMembers([]);
      }
    } else {
      console.error('Failed to load assignments:', assignmentResult.reason);

      setAssignmentError(
        assignmentResult.reason instanceof Error
          ? assignmentResult.reason.message
          : 'Unable to load assignments. Please try again.',
      );
    }

    // Handle trip history
    if (historyResult.status === 'fulfilled') {
      setTripHistory(historyResult.value);
    } else {
      console.error('Failed to load trip history:', historyResult.reason);
    }

    setIsRefreshing(false);
  }, []);
  useEffect(() => {
    refreshData();
  }, [refreshData]);
  useEffect(() => {
    const messaging = getMessaging();

    const unsubscribe = onMessage(messaging, async remoteMessage => {
      console.log('Mapped notification:', notification);

      setNotifications(prev => {
        const updated = [
          notification,
          ...prev.filter(item => item.id !== notification.id),
        ];

        console.log('Updated notification list:', updated);

        return updated;
      });
      console.log('FCM notification received:', remoteMessage);

      const notification: NotificationData = {
        id: remoteMessage.messageId || String(Date.now()),
        title: remoteMessage.notification?.title || 'New Notification',
        detail: remoteMessage.notification?.body || '',
        time: 'Just now',
        isNew: true,
        relatedTripId: remoteMessage.data?.trip_id
          ? String(remoteMessage.data.trip_id)
          : undefined,
      };

      setNotifications(prev => [
        notification,
        ...prev.filter(item => item.id !== notification.id),
      ]);
    });

    return unsubscribe;
  }, []);
  const resetTrip = useCallback(() => {
    setTripStage('assigned');
  }, []);

  return (
    <AppContext.Provider
      value={{
        user,
        currentTrip,
        upcomingTrip: null,
        tripStage,
        notifications,
        unreadCount,
        teamMembers,
        tripHistory,
        isRefreshing,
        assignmentError,
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

  if (!ctx) {
    throw new Error('useApp must be inside AppProvider');
  }

  return ctx;
};
