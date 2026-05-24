import type { Pagination } from '@/src/types/api';

export type NotificationType =
  | 'application_status'
  | 'interview_scheduled'
  | 'offer_received'
  | 'job_closed'
  | 'profile_view'
  | 'new_applicant'
  | 'message_received';

export interface Notification {
  id:          string;
  type:        NotificationType;
  title:       string;
  message:     string;
  is_read:     boolean;
  action_url?: string;
  created_at:  string;
}

export interface NotificationsListResponse {
  notifications: Notification[];
  pagination:    Pagination;
}

export interface NotificationCount {
  unread_notifications: number;
  unread_messages:      number;
}
