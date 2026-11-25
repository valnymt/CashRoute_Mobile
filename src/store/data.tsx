import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
} from 'react';

import { AppState as NativeAppState } from 'react-native';
import {
  getNotifications, readNotification, readAllNotifications,
} from '../services/notificationInbox';
import type { DeliveryNotification } from '../services/notificationInbox';
import { getTripHistory } from '../services/tripHistory';

import { getMyAssignments } from '../services/assignment';

import type {
  TripData,
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
  notifications: DeliveryNotification[];
  notificationError: string | null;
  notificationsLoading: boolean;
  refreshNotifications: () => Promise<void>;
  unreadCount: number;
  tripHistory: HistoryTrip[];
  teamMembers: TeamMember[];
  isRefreshing: boolean;
  assignmentError: string | null;

  advanceStage: () => void;
  markNotificationRead: (id: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
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
const normalizeStatus = (status: string) => status.toLowerCase().replace(/[\s_]+/g, '_');

function mapAssignmentToTrip(item: BackendAssignment): TripData {
  const normalizedStatus = normalizeStatus(item.status);

  const status =
    normalizedStatus === 'in_transit'
      ? 'In Transit'
      : normalizedStatus === 'completed'
        ? 'Completed'
        : 'Assigned';

  return {
    id: item.reference,

    // Numeric IDs are needed by the OTP backend.
    cashRequestId: item.cash_request_id,
    tripId: item.trip_id,
    acceptedAt: item.accepted_at,
    canAccept: item.can_accept === true,
    leaderName: item.leader_name,

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

export const AppProvider: React.FC<{
  children: React.ReactNode;
  isSignedIn: boolean;
  pushRevision?: number;
}> = ({ children, isSignedIn, pushRevision = 0 }) => {
  const [tripStage, setTripStage] = useState<TripStage>('assigned');
  const [notifications, setNotifications] = useState<DeliveryNotification[]>([]);
  const [notificationError, setNotificationError] = useState<string | null>(null);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const notificationRevision = useRef(0);
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

  const unreadCount = notifications.filter(n => !n.read).length;

  const advanceStage = useCallback(() => {
    setTripStage(prev => {
      const idx = STAGE_ORDER.indexOf(prev);
      return idx < STAGE_ORDER.length - 1
        ? STAGE_ORDER[idx + 1]
        : prev;
    });
  }, []);

  const refreshNotifications = useCallback(async () => {
    const revision = ++notificationRevision.current;
    setNotificationsLoading(true);
    try {
      const items = await getNotifications();
      if (revision === notificationRevision.current) {
        setNotifications(items);
        setNotificationError(null);
      }
    } catch {
      if (revision === notificationRevision.current) setNotificationError('Unable to load notifications.');
    } finally {
      if (revision === notificationRevision.current) setNotificationsLoading(false);
    }
  }, []);

  const markNotificationRead = useCallback(async (id: string) => {
    await readNotification(id);
    setNotifications(items => items.map(item => item.id === id ? { ...item, read: true } : item));
    void refreshNotifications();
  }, [refreshNotifications]);

  const markAllNotificationsRead = useCallback(async () => {
    try {
      await readAllNotifications();
      setNotifications(items => items.map(item => ({ ...item, read: true })));
      await refreshNotifications();
    } catch {
      setNotificationError('Unable to mark notifications as read.');
    }
  }, [refreshNotifications]);

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
      console.log(
        '[Assignments]',
        assignments.map(item => ({
          reference: item.reference,
          status: item.status,
          cash_request_id: item.cash_request_id,
          trip_id: item.trip_id,
        })),
      );

      const activeAssignments = assignments.filter(item =>
        ['assigned', 'reassigned', 'in_transit'].includes(
          normalizeStatus(item.status),
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
    if (isSignedIn) {
      void refreshData();
      void refreshNotifications();
    }
  }, [isSignedIn, pushRevision, refreshData, refreshNotifications]);

  useEffect(() => {
    if (!isSignedIn) return;
    const subscription = NativeAppState.addEventListener('change', state => {
      if (state === 'active') {
        void refreshNotifications();
        void refreshData();
      }
    });
    const interval = setInterval(() => {
      if (NativeAppState.currentState === 'active') void refreshNotifications();
    }, 45000);
    return () => {
      subscription.remove();
      clearInterval(interval);
    };
  }, [isSignedIn, refreshData, refreshNotifications]);

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
        notificationError,
        notificationsLoading,
        refreshNotifications,
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
