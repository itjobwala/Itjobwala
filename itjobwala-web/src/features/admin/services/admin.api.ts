import { adminClient, publicClient } from '@/src/lib/api/client';
import type {
  AdminStats,
  AdminCandidate,
  AdminRecruiter,
  AdminJob,
  AdminQueueJob,
  AdminReport,
  AdminAction,
  AdminPaginated,
  SignupAnalytics,
  JobsAnalytics,
  AppAnalytics,
} from '../types/admin.types';

type AdminLoginResponse = {
  success: boolean;
  message: string;
  token: string;
  data: { id: number; email: string; full_name: string };
};

type AdminMeResponse = {
  success: boolean;
  message: string;
  data: { id: number; email: string; full_name: string; created_at: string };
};

export async function adminLogin(email: string, password: string) {
  const res = await publicClient.post<AdminLoginResponse>('/admin/login', { email, password });
  return res.data;
}

export async function getAdminMe() {
  const res = await adminClient.get<AdminMeResponse>('/admin/me');
  return res.data.data;
}

export async function getAdminStats(): Promise<AdminStats> {
  const res = await adminClient.get<{ success: boolean; data: AdminStats }>('/admin/stats');
  return res.data.data;
}

export async function getAdminUsers(params: {
  role?: 'candidate' | 'recruiter';
  search?: string;
  status?: 'active' | 'suspended';
  page?: number;
}): Promise<AdminPaginated<AdminCandidate | AdminRecruiter>> {
  const res = await adminClient.get<{ success: boolean; data: AdminPaginated<AdminCandidate | AdminRecruiter> }>(
    '/admin/users',
    { params },
  );
  return res.data.data;
}

export async function getAdminUserDetail(role: 'candidate' | 'recruiter', id: number) {
  const res = await adminClient.get<{ success: boolean; data: AdminCandidate | AdminRecruiter }>(
    `/admin/users/${role}/${id}`,
  );
  return res.data.data;
}

export async function patchUserStatus(role: 'candidate' | 'recruiter', id: number, is_active: boolean) {
  const res = await adminClient.patch<{ success: boolean; message: string; data: { id: number; is_active: boolean } }>(
    `/admin/users/${role}/${id}/status`,
    { is_active },
  );
  return res.data;
}

export async function patchRecruiterVerify(id: number, is_verified: boolean) {
  const res = await adminClient.patch<{ success: boolean; message: string; data: { id: number; is_verified: boolean } }>(
    `/admin/recruiters/${id}/verify`,
    { is_verified },
  );
  return res.data;
}

export async function getAdminJobs(params: {
  search?: string;
  status?: string;
  page?: number;
}): Promise<AdminPaginated<AdminJob>> {
  const res = await adminClient.get<{ success: boolean; data: AdminPaginated<AdminJob> }>(
    '/admin/jobs',
    { params },
  );
  return res.data.data;
}

export async function patchJobStatus(id: number, status: string) {
  const res = await adminClient.patch<{ success: boolean; message: string; data: { id: number; status: string } }>(
    `/admin/jobs/${id}/status`,
    { status },
  );
  return res.data;
}

export async function getAdminActions(page = 1): Promise<AdminPaginated<AdminAction>> {
  const res = await adminClient.get<{ success: boolean; data: AdminPaginated<AdminAction> }>(
    '/admin/actions',
    { params: { page } },
  );
  return res.data.data;
}

export async function getAdminJobQueue(page = 1): Promise<AdminPaginated<AdminQueueJob>> {
  const res = await adminClient.get<{ success: boolean; data: AdminPaginated<AdminQueueJob> }>(
    '/admin/jobs/queue',
    { params: { page } },
  );
  return res.data.data;
}

export async function moderateJob(
  id: number,
  decision: 'approve' | 'needs_changes' | 'remove',
  reason?: string,
) {
  const res = await adminClient.patch<{ success: boolean; message: string; data: { id: number; status: string; moderation_reason: string | null } }>(
    `/admin/jobs/${id}/moderate`,
    { decision, reason },
  );
  return res.data;
}

export async function getAdminReports(params: {
  status?: 'open' | 'resolved' | 'dismissed';
  page?: number;
}): Promise<AdminPaginated<AdminReport>> {
  const res = await adminClient.get<{ success: boolean; data: AdminPaginated<AdminReport> }>(
    '/admin/reports',
    { params },
  );
  return res.data.data;
}

export async function resolveAdminReport(
  id: number,
  status: 'resolved' | 'dismissed',
  resolution_note?: string,
) {
  const res = await adminClient.patch<{ success: boolean; message: string; data: { id: number; status: string } }>(
    `/admin/reports/${id}`,
    { status, resolution_note },
  );
  return res.data;
}

// ── Analytics ─────────────────────────────────────────────────────────────────

export async function getSignupAnalytics(range = '30d'): Promise<SignupAnalytics> {
  const res = await adminClient.get<{ success: boolean; data: SignupAnalytics }>(
    '/admin/analytics/signups',
    { params: { range } },
  );
  return res.data.data;
}

export async function getJobsAnalytics(range = '30d'): Promise<JobsAnalytics> {
  const res = await adminClient.get<{ success: boolean; data: JobsAnalytics }>(
    '/admin/analytics/jobs',
    { params: { range } },
  );
  return res.data.data;
}

export async function getAppAnalytics(range = '30d'): Promise<AppAnalytics> {
  const res = await adminClient.get<{ success: boolean; data: AppAnalytics }>(
    '/admin/analytics/applications',
    { params: { range } },
  );
  return res.data.data;
}

// ── CSV exports ───────────────────────────────────────────────────────────────
// Endpoints return raw text/csv — not the JSON envelope.
// Use adminClient with responseType:'blob' then trigger a browser download.

export async function downloadAdminCsv(
  path: string,
  params: Record<string, string>,
  filename: string,
): Promise<void> {
  const res = await adminClient.get(path, { params, responseType: 'blob' });
  const url = URL.createObjectURL(new Blob([res.data as BlobPart], { type: 'text/csv' }));
  const a   = document.createElement('a');
  a.href     = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
