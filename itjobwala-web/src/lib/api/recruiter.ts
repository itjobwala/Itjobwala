import apiClient, { recruiterClient } from './client';
import { setRecruiterTokenCookie } from '@/src/lib/auth';
import type { ApiResponse } from '@/src/types/api';
import type {
  RecruiterCompanyProfile,
  RecruiterPostedJob,
  RecruiterApplicant,
  UpdateCompanyProfileRequest,
  CreateJobPostRequest,
  UpdateJobPostRequest,
  UpdateApplicantStatusRequest,
  RecruiterJobsResponse,
  RecruiterApplicantsResponse,
  RecruiterCompanyProfileResponse,
  RecruiterJobDetailResponse,
  RecruiterInterview,
  ScheduleInterviewRequest,
  RecruiterInterviewsResponse,
} from '@/src/types/recruiter';

// ── Recruiter Authentication ──────────────────────────────────────────────────

interface RecruiterAuthResponse {
  success: boolean;
  message: string;
  token?: string;
}

export interface RecruiterSignupRequest {
  full_name: string;
  company_name: string;
  email: string;
  password: string;
  phone?: string;
  terms_accepted: boolean;
}

export async function signupRecruiter(data: RecruiterSignupRequest): Promise<{ token?: string }> {
  const res = await apiClient.post<RecruiterAuthResponse>('/auth/recruiter/signup', data);
  const token = res.data.token;
  if (token) {
    localStorage.setItem('recruiter_token', token);
    setRecruiterTokenCookie(token);
  }
  return { token };
}

export interface RecruiterSigninRequest {
  email: string;
  password: string;
}

export async function signinRecruiter(data: RecruiterSigninRequest): Promise<void> {
  const response = await apiClient.post<RecruiterAuthResponse>('/auth/recruiter/signin', data);
  const token = response.data.token;
  if (token) {
    localStorage.setItem('recruiter_token', token);
    setRecruiterTokenCookie(token);
  } else {
    throw new Error('No token in response');
  }
}

// ── Company Profile endpoints ──────────────────────────────────────────────────
export async function getRecruiterCompanyProfile(): Promise<RecruiterCompanyProfile> {
  const res = await recruiterClient.get<RecruiterCompanyProfileResponse>(
    '/recruiter/company'
  );
  return res.data.data;
}

export async function updateRecruiterCompanyProfile(
  data: UpdateCompanyProfileRequest
): Promise<RecruiterCompanyProfile> {
  const res = await recruiterClient.put<RecruiterCompanyProfileResponse>(
    '/recruiter/company',
    data
  );
  return res.data.data;
}

const UPLOAD_TIMEOUT = 120_000;

export async function uploadRecruiterCompanyLogo(file: File): Promise<string> {
  const fd = new FormData();
  fd.append('file', file);
  const res = await recruiterClient.post<{ success: boolean; data: { logo: string } }>(
    '/recruiter/company/logo',
    fd,
    { headers: { 'Content-Type': 'multipart/form-data' }, timeout: UPLOAD_TIMEOUT }
  );
  return res.data.data.logo;
}

// Dashboard Stats
export interface RecruiterStats {
  activeJobs: number;
  totalApplicants: number;
  interviewsScheduled: number;
  hired: number;
  byStatus: Record<string, number>;
}

export async function getRecruiterStats(): Promise<RecruiterStats> {
  const res = await recruiterClient.get<{ success: boolean; data: RecruiterStats }>('/recruiter/stats');
  return res.data.data;
}

// Posted Jobs endpoints
export async function getRecruiterPostedJobs(filters?: {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
}): Promise<RecruiterJobsResponse['data']> {
  const res = await recruiterClient.get<RecruiterJobsResponse>(
    '/recruiter/jobs',
    { params: { page: 1, limit: 20, ...filters } }
  );
  return res.data.data;
}

export async function getRecruiterPostedJobById(jobId: string): Promise<RecruiterPostedJob> {
  const res = await recruiterClient.get<RecruiterJobDetailResponse>(
    `/recruiter/jobs/${jobId}`
  );
  return res.data.data;
}

export async function createRecruiterJob(
  data: CreateJobPostRequest
): Promise<RecruiterPostedJob> {
  const res = await recruiterClient.post<RecruiterJobDetailResponse>(
    '/recruiter/jobs',
    data
  );
  return res.data.data;
}

export async function updateRecruiterJob(
  jobId: string,
  data: UpdateJobPostRequest
): Promise<RecruiterPostedJob> {
  const res = await recruiterClient.put<RecruiterJobDetailResponse>(
    `/recruiter/jobs/${jobId}`,
    data
  );
  return res.data.data;
}

export async function deleteRecruiterJob(jobId: string): Promise<void> {
  await recruiterClient.delete(`/recruiter/jobs/${jobId}`);
}

// Applicants endpoints
export async function getRecruiterApplicants(
  filters?: {
    jobId?: string;
    status?: string;
    page?: number;
    limit?: number;
  }
): Promise<RecruiterApplicantsResponse['data']> {
  const res = await recruiterClient.get<RecruiterApplicantsResponse>(
    '/recruiter/applicants',
    { params: filters }
  );
  return res.data.data;
}

export async function getRecruiterApplicantById(
  applicantId: string
): Promise<RecruiterApplicant> {
  const res = await recruiterClient.get<ApiResponse<RecruiterApplicant>>(
    `/recruiter/applicants/${applicantId}`
  );
  return res.data.data!;
}

export async function updateApplicantStatus(
  applicantId: string,
  data: UpdateApplicantStatusRequest
): Promise<RecruiterApplicant> {
  const res = await recruiterClient.put<ApiResponse<RecruiterApplicant>>(
    `/recruiter/applicants/${applicantId}/status`,
    data
  );
  return res.data.data!;
}

export async function rejectApplicant(applicantId: string): Promise<void> {
  await recruiterClient.post(
    `/recruiter/applicants/${applicantId}/reject`,
    {}
  );
}

export async function shortlistApplicant(applicantId: string): Promise<void> {
  await recruiterClient.post(
    `/recruiter/applicants/${applicantId}/shortlist`,
    {}
  );
}

export async function hireApplicant(applicantId: string): Promise<void> {
  await recruiterClient.post(
    `/recruiter/applicants/${applicantId}/hire`,
    {}
  );
}

// Notifications
export interface RecruiterNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  action_url: string | null;
  created_at: string;
}

export async function getRecruiterNotifications(limit = 10): Promise<RecruiterNotification[]> {
  const res = await recruiterClient.get<{
    success: boolean;
    data: { notifications: RecruiterNotification[]; unread_count: number };
  }>('/notifications', { params: { limit } });
  return res.data.data.notifications;
}

// Interviews endpoints
export async function getRecruiterInterviews(): Promise<RecruiterInterview[]> {
  const res = await recruiterClient.get<RecruiterInterviewsResponse>('/recruiter/interviews');
  return res.data.data.interviews;
}

export async function scheduleRecruiterInterview(
  data: ScheduleInterviewRequest
): Promise<RecruiterInterview> {
  const res = await recruiterClient.post<{ success: boolean; data: RecruiterInterview }>(
    '/recruiter/interviews',
    data
  );
  return res.data.data;
}
