// Mock fixtures used by the store while there's no backend wired up yet.
// Moved here from src/data/mockData.ts to match the portal's layout
// (services/mockApi + services/mockData). When the real API lands,
// src/services/httpApi.ts will replace these fixtures at the store layer.

import type { TripData, NotificationData, HistoryTrip, TeamMember } from '../types';

export const CURRENT_TRIP: TripData = {
  id: 'REQ-1048',
  type: 'Deposit',
  amount: '250,000',
  currency: 'MMK',
  pickupName: 'Orchard Branch',
  pickupAddr: '138 Orchard Rd, Myanmar',
  dropOffName: 'HQ Cash Centre',
  dropOffAddr: '1 Raffles Quay, Myanmar',
  contactName: 'Amy Tan · Orchard Branch',
  contactInfo: 'SMS +95912345678 · a•••@bank.com',
  dropOffContact: 'Ops Desk · HQ Cash Centre',
  dropOffContactInfo: 'SMS +95987654321 · ops•••@bank.com',
  remarks: 'Daily surplus cash. Contact the branch manager on arrival.',
  timeSlot: '14 Oct · 10:00 – 12:00',
  status: 'Assigned',
  date: '14 Oct 2026',
  team: 'Team A',
};

export const UPCOMING_TRIP: TripData = {
  id: 'REQ-1053',
  type: 'Withdrawal',
  amount: '120,000',
  currency: 'SGD',
  pickupName: 'HQ',
  pickupAddr: 'HQ Building',
  dropOffName: 'Tampines',
  dropOffAddr: 'Tampines Branch',
  contactName: 'Front Desk · HQ',
  contactInfo: 'SMS +95900000000',
  dropOffContact: 'Manager · Tampines',
  dropOffContactInfo: 'SMS +95911111111',
  remarks: '',
  timeSlot: '15 Oct · 13:00 – 15:00',
  status: 'Assigned',
  date: '15 Oct 2026',
  team: 'Team A',
};

export const TEAM_MEMBERS: TeamMember[] = [
  {
    name: 'Ngeyeemon',
    initials: 'NYM',
    role: 'Driver',
    phone: '+95912345678',
  },
  {
    name: 'Kyaw Zin',
    initials: 'KZ',
    role: 'Custodian',
    phone: '+95987654321',
  },
];

export const NOTIFICATIONS: NotificationData[] = [
  {
    id: 'n1',
    title: 'New assignment',
    detail: 'REQ-1048 Deposit · MMK 250,000 · Orchard → HQ',
    time: '2 min ago',
    isNew: true,
    relatedTripId: 'REQ-1048',
  },
  {
    id: 'n2',
    title: 'Assignment scheduled',
    detail: 'REQ-1053 Withdrawal · 15 Oct 13:00',
    time: '1 h ago',
    isNew: true,
    relatedTripId: 'REQ-1053',
  },
  {
    id: 'n3',
    title: 'Trip completed',
    detail: 'REQ-1038 · proof of delivery saved',
    time: 'Yesterday',
    isNew: false,
    relatedTripId: 'REQ-1038',
  },
  {
    id: 'n4',
    title: 'System maintenance',
    detail: 'Scheduled downtime 22 Oct 02:00–04:00',
    time: '2 days ago',
    isNew: false,
  },
];

export const TRIP_HISTORY: HistoryTrip[] = [
  {
    id: 'REQ-1038',
    date: '13 Oct',
    branch: 'Latha Branch',
    amount: 'MMK 120,000',
    status: 'Completed',
    type: 'Withdrawal · HQ → Latha Branch',
    team: 'Team A',
    duration: '51 min',
    onTime: true,
    timeline: [
      { label: 'Accepted · 08:55' },
      { label: 'Pickup OTP verified · 09:22' },
      { label: 'Drop-off OTP verified · 09:44' },
      { label: 'Proof saved · 09:47' },
    ],
  },
  {
    id: 'REQ-1035',
    date: '12 Oct',
    branch: 'TimeCity Branch',
    amount: 'MMK 90,000',
    status: 'Completed',
    type: 'Deposit · TimeCity → HQ',
    team: 'Team A',
    duration: '38 min',
    onTime: true,
    timeline: [
      { label: 'Accepted · 14:10' },
      { label: 'Pickup OTP verified · 14:30' },
      { label: 'Drop-off OTP verified · 14:45' },
      { label: 'Proof saved · 14:48' },
    ],
  },
  {
    id: 'REQ-1033',
    date: '11 Oct',
    branch: 'Kamayut Branch',
    amount: 'MMK 60,000',
    status: 'Cancelled',
    type: 'Deposit · Kamayut → HQ',
    team: 'Team A',
    duration: '—',
    onTime: false,
    timeline: [
      { label: 'Accepted · 10:00' },
      { label: 'Cancelled by admin · 10:22' },
    ],
  },
  {
    id: 'REQ-1030',
    date: '10 Oct',
    branch: 'Insein Branch',
    amount: 'MMK 200,000',
    status: 'Completed',
    type: 'Withdrawal · HQ → Insein Branch',
    team: 'Team A',
    duration: '65 min',
    onTime: false,
    timeline: [
      { label: 'Accepted · 09:00' },
      { label: 'Pickup OTP verified · 09:35' },
      { label: 'Drop-off OTP verified · 10:02' },
      { label: 'Proof saved · 10:05' },
    ],
  },
  {
    id: 'REQ-1027',
    date: '09 Oct',
    branch: 'Yay Kyaw Branch',
    amount: 'MMK 150,000',
    status: 'Completed',
    type: 'Deposit · Yay Kyaw → HQ',
    team: 'Team A',
    duration: '44 min',
    onTime: true,
    timeline: [
      { label: 'Accepted · 11:00' },
      { label: 'Pickup OTP verified · 11:25' },
      { label: 'Drop-off OTP verified · 11:40' },
      { label: 'Proof saved · 11:44' },
    ],
  },
];
