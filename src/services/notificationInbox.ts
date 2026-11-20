import { apiRequest } from './api';
import type { BackendAssignment } from './assignment';

export interface DeliveryNotification {
  id: string;
  title: string;
  body: string;
  type: string;
  at: string | null;
  read: boolean;
}

export interface DeliveryNotificationDetail {
  data: DeliveryNotification;
  reference: string | null;
  assignment: (BackendAssignment & { time_slot?: string | null }) | null;
  cancelReason: string | null;
}

export async function getNotifications(): Promise<DeliveryNotification[]> {
  const response = await apiRequest<{ data: DeliveryNotification[] }>('/notifications');
  return response.data;
}

export function getNotification(id: string): Promise<DeliveryNotificationDetail> {
  return apiRequest('/notifications/' + encodeURIComponent(id));
}

export function readNotification(id: string): Promise<void> {
  return apiRequest('/notifications/' + encodeURIComponent(id) + '/read', { method: 'POST' });
}

export function readAllNotifications(): Promise<void> {
  return apiRequest('/notifications/read-all', { method: 'POST' });
}
