// Shared domain types — mirrors the portal's src/types/index.ts pattern.
// Keep this file the single source of truth for shapes used across screens,
// context, and (later) the API client.

export type TripStatus = 'Assigned' | 'In Transit' | 'Completed' | 'Cancelled';

export type TripStage =
  | 'assigned'
  | 'pickupEnRoute'
  | 'pickupArrived'
  | 'pickupVerified'
  | 'dropOffEnRoute'
  | 'dropOffArrived'
  | 'dropOffVerified'
  | 'proofSubmitted'
  | 'completed';

export interface TripData {
  id: string;
  type: 'Deposit' | 'Withdrawal';
  amount: string;
  currency: string;
  pickupName: string;
  pickupAddr: string;
  dropOffName: string;
  dropOffAddr: string;
  contactName: string;
  contactInfo: string;
  dropOffContact: string;
  dropOffContactInfo: string;
  remarks: string;
  timeSlot: string;
  status: TripStatus;
  date: string;
  team: string;
}

export interface NotificationData {
  id: string;
  title: string;
  detail: string;
  time: string;
  isNew: boolean;
  relatedTripId?: string;
}

export interface HistoryTrip {
  id: string;
  date: string;
  branch: string;
  amount: string;
  status: 'Completed' | 'Cancelled';
  type: string;
  team: string;
  duration: string;
  onTime: boolean;
  timeline: { label: string }[];
}

export interface User {
  name: string;
  initials: string;
  team: string;
  role: 'Driver' | 'Custodian' | 'Maker' | 'Checker' | 'Super Admin';
}
