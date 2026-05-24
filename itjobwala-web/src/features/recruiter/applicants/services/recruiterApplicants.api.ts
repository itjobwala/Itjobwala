import { recruiterClient } from '@/src/lib/api/client';
import type { ApiResponse } from '@/src/types/api';
import type {
  RecruiterApplicant,
  UpdateApplicantStatusRequest,
  RecruiterApplicantsResponse,
} from '@/features/recruiter/types';

export async function getRecruiterApplicants(filters?: {
  jobId?:   string;
  status?:  string;
  page?:    number;
  limit?:   number;
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
