import { recruiterClient } from '@/src/lib/api/client';

export interface RecruiterDashboardStats {
  active_jobs:          number;
  active_jobs_change:   number;
  total_applicants:     number;
  applicants_change:    number;
  interviews_scheduled: number;
  interviews_change:    number;
  hires_made:           number;
  hires_change:         number;
  profile_views:        number;
  profile_views_change: number;
  time_to_hire_days:    number | null;
}

export async function getDashboardStats(): Promise<RecruiterDashboardStats> {
  const res = await recruiterClient.get<{ success: boolean; data: RecruiterDashboardStats }>(
    '/recruiter/dashboard/stats',
  );
  return res.data.data;
}

export interface RecruiterStats {
  activeJobs:           number;
  totalApplicants:      number;
  interviewsScheduled:  number;
  hired:                number;
  byStatus:             Record<string, number>;
}

export async function getRecruiterStats(): Promise<RecruiterStats> {
  const res = await recruiterClient.get<{ success: boolean; data: RecruiterStats }>(
    '/recruiter/stats',
  );
  return res.data.data;
}

export interface RecruiterNotification {
  id:         string;
  type:       string;
  title:      string;
  message:    string;
  is_read:    boolean;
  action_url: string | null;
  created_at: string;
}

export interface RecruiterNotificationPage {
  notifications:  RecruiterNotification[];
  unread_count:   number;
  pagination: {
    page:        number;
    limit:       number;
    total:       number;
    total_pages: number;
    has_next:    boolean;
    has_prev:    boolean;
  };
}

export async function getRecruiterNotifications(limit = 10): Promise<RecruiterNotification[]> {
  const res = await recruiterClient.get<{
    success: boolean;
    data: RecruiterNotificationPage;
  }>('/notifications', { params: { limit } });
  return res.data.data.notifications;
}

export async function getRecruiterNotificationsPaged(
  page = 1,
  limit = 20,
): Promise<RecruiterNotificationPage> {
  const res = await recruiterClient.get<{
    success: boolean;
    data: RecruiterNotificationPage;
  }>('/notifications', { params: { page, limit } });
  return res.data.data;
}

export async function markNotificationRead(notificationId: string): Promise<void> {
  await recruiterClient.put(`/notifications/${notificationId}/read`);
}

export async function markAllNotificationsRead(): Promise<void> {
  await recruiterClient.put('/notifications/read-all');
}
