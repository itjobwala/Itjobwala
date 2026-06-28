import { recruiterClient } from '@/src/lib/api/client';
import type { ApiResponse } from '@/src/types/api';
import type {
  RecruiterApplicant,
  UpdateApplicantStatusRequest,
  RecruiterApplicantsResponse,
  ApplicantATSIntelligence,
  PoolIntelligence,
  BulkRejectResponse,
  TopCandidate,
} from '@/features/recruiter/types';

export async function getRecruiterApplicants(filters?: {
  jobId?:     string;
  status?:    string;
  page?:      number;
  limit?:     number;
  sortBy?:    string;
  sortOrder?: 'asc' | 'desc';
  minScore?:  number;
}): Promise<RecruiterApplicantsResponse['data']> {
  const res = await recruiterClient.get<RecruiterApplicantsResponse>(
    '/recruiter/applicants',
    { params: filters },
  );
  return res.data.data;
}

export async function getRecruiterApplicantById(
  applicantId: string,
): Promise<RecruiterApplicant> {
  const res = await recruiterClient.get<ApiResponse<RecruiterApplicant>>(
    `/recruiter/applicants/${applicantId}`,
  );
  return res.data.data!;
}

export async function updateApplicantStatus(
  applicantId: string,
  data: UpdateApplicantStatusRequest,
): Promise<RecruiterApplicant> {
  const res = await recruiterClient.put<ApiResponse<RecruiterApplicant>>(
    `/recruiter/applicants/${applicantId}/status`,
    data,
  );
  return res.data.data!;
}

export async function rejectApplicant(applicantId: string): Promise<void> {
  await recruiterClient.post(`/recruiter/applicants/${applicantId}/reject`, {});
}

export async function shortlistApplicant(applicantId: string): Promise<void> {
  await recruiterClient.post(`/recruiter/applicants/${applicantId}/shortlist`, {});
}

export async function hireApplicant(applicantId: string): Promise<void> {
  await recruiterClient.post(`/recruiter/applicants/${applicantId}/hire`, {});
}

export async function bulkRejectApplicants(
  applicationIds: string[],
): Promise<BulkRejectResponse> {
  const res = await recruiterClient.post<ApiResponse<BulkRejectResponse>>(
    '/recruiter/applicants/bulk-reject',
    { applicationIds },
  );
  return res.data.data!;
}

export async function getApplicantATSIntelligence(
  applicantId: string,
): Promise<ApplicantATSIntelligence> {
  const res = await recruiterClient.get<ApiResponse<ApplicantATSIntelligence>>(
    `/recruiter/applicants/${applicantId}/ats-intelligence`,
  );
  return res.data.data!;
}

export async function getJobPoolStats(jobId: string): Promise<PoolIntelligence> {
  const res = await recruiterClient.get<ApiResponse<PoolIntelligence>>(
    `/recruiter/jobs/${jobId}/pool-stats`,
  );
  return res.data.data!;
}

export async function bulkRejectByScore(params: {
  minScore: number;
  jobId?: string;
}): Promise<BulkRejectResponse> {
  const res = await recruiterClient.post<ApiResponse<BulkRejectResponse>>(
    '/recruiter/applicants/bulk-reject-by-score',
    params,
  );
  return res.data.data!;
}

export async function getTopCandidates(limit?: number): Promise<{ candidates: TopCandidate[] }> {
  const res = await recruiterClient.get<ApiResponse<{ candidates: TopCandidate[] }>>(
    '/recruiter/dashboard/top-candidates',
    { params: limit ? { limit } : undefined },
  );
  return res.data.data!;
}
