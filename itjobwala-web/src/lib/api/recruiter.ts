import apiClient, { recruiterClient } from './client';
import { setRecruiterTokenCookie, setAuth } from '@/src/lib/auth';
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
} from '@/src/types/recruiter';

// ── Recruiter Authentication ──────────────────────────────────────────────────

export interface RecruiterSignupRequest {
  company_name: string;
  email: string;
  password: string;
  phone?: string;
  terms_accepted: boolean;
}

export async function signupRecruiter(data: RecruiterSignupRequest): Promise<{ token?: string }> {
  const res = await apiClient.post<any>('/auth/recruiter/signup', data);
  const token = res.data.token;
  if (token) {
    localStorage.setItem('recruiter_token', token);
    setRecruiterTokenCookie(token);
    setAuth(data.email);
  }
  return { token };
}

export interface RecruiterSigninRequest {
  email: string;
  password: string;
}

export async function signinRecruiter(data: RecruiterSigninRequest): Promise<void> {
  const response = await apiClient.post<any>('/auth/recruiter/signin', data);
  const token = response.data.token;
  if (token) {
    localStorage.setItem('recruiter_token', token);
    setRecruiterTokenCookie(token);
    setAuth(data.email);
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

// Posted Jobs endpoints
export async function getRecruiterPostedJobs(
  page = 1,
  limit = 20
): Promise<{ jobs: RecruiterPostedJob[]; pagination?: any }> {
  const res = await recruiterClient.get<RecruiterJobsResponse>(
    '/recruiter/jobs',
    { params: { page, limit } }
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
): Promise<{ applicants: RecruiterApplicant[]; pagination?: any }> {
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
