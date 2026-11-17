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
  // Phone the delivery team can tap-to-call on the pickup contact.
  pickupContactPhone?: string;
  dropOffContact: string;
  dropOffContactInfo: string;
  dropOffContactPhone?: string;
  remarks: string;
  timeSlot: string;
  status: TripStatus;
  date: string;
  team: string;
  // Who raised this on the portal — the delivery team needs to know
  // who to ping if the remarks are unclear.
  createdBy?: string;
  createdByRole?: 'Maker' | 'Checker' | 'Super Admin';
  // Who approved it (the Checker who assigned the team).
  approvedBy?: string;
  approvedByRole?: 'Checker' | 'Super Admin';
  approvedAt?: string;
  // The "complete within" SLA the Maker picked ("Within 3 hours").
  completeWithin?: string;

  cashRequestId: number;
  tripId: number;

  pickupLatitude: number | null;
  pickupLongitude: number | null;

  dropOffLatitude: number | null;
  dropOffLongitude: number | null;
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

export interface TeamMember {
  name: string;
  initials: string;
  role: string;
  phone: string;
}

export interface User {
  name: string;
  initials: string;
  team: string;
  role: 'Driver' | 'Custodian' | 'Maker' | 'Checker' | 'Super Admin';
}
