import apiClient from './client';
import type { ApiResponse } from '@/src/types/api';
import type {
  NotificationsListResponse,
  NotificationCount,
} from '@/src/types/notifications';

// GET /notifications
export async function getNotifications(params: {
  page?:    number;
  limit?:   number;
  is_read?: boolean;
  type?:    string;
} = {}): Promise<NotificationsListResponse> {
  const res = await apiClient.get<ApiResponse<NotificationsListResponse>>(
    '/notifications',
    { params },
  );
  return res.data.data!;
}

// PUT /notifications/:notification_id/read  (Postman uses PUT)
export async function markNotificationRead(notificationId: string): Promise<void> {
  await apiClient.put<ApiResponse>(`/notifications/${notificationId}/read`);
}

// PUT /notifications/read-all
export async function markAllNotificationsRead(): Promise<void> {
  await apiClient.put<ApiResponse>('/notifications/read-all');
}

// GET /notifications/count
export async function getNotificationCount(): Promise<NotificationCount> {
  const res = await apiClient.get<ApiResponse<NotificationCount>>(
    '/notifications/count',
  );
  return res.data.data!;
}
