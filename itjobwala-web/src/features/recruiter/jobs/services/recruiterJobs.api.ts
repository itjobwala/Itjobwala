import { recruiterClient } from '@/src/lib/api/client';
import type {
  RecruiterPostedJob,
  CreateJobPostRequest,
  UpdateJobPostRequest,
  RecruiterJobsResponse,
  RecruiterJobDetailResponse,
  JobAnalytics,
} from '@/features/recruiter/types';

export async function getRecruiterPostedJobs(filters?: {
  page?:   number;
  limit?:  number;
  status?: string;
  search?: string;
}): Promise<RecruiterJobsResponse['data']> {
  const res = await recruiterClient.get<RecruiterJobsResponse>(
    '/recruiter/jobs',
    { params: { page: 1, limit: 20, ...filters } },
  );
  return res.data.data;
}

export async function getRecruiterPostedJobById(jobId: string): Promise<RecruiterPostedJob> {
  const res = await recruiterClient.get<RecruiterJobDetailResponse>(`/recruiter/jobs/${jobId}`);
  return res.data.data;
}

export async function createRecruiterJob(data: CreateJobPostRequest): Promise<RecruiterPostedJob> {
  const res = await recruiterClient.post<RecruiterJobDetailResponse>('/recruiter/jobs', data);
  return res.data.data;
}

export async function updateRecruiterJob(
  jobId: string,
  data: UpdateJobPostRequest,
): Promise<RecruiterPostedJob> {
  const res = await recruiterClient.put<RecruiterJobDetailResponse>(
    `/recruiter/jobs/${jobId}`,
    data,
  );
  return res.data.data;
}

export async function deleteRecruiterJob(jobId: string): Promise<void> {
  await recruiterClient.delete(`/recruiter/jobs/${jobId}`);
}

export async function submitRecruiterJob(jobId: string): Promise<RecruiterPostedJob> {
  const res = await recruiterClient.post<RecruiterJobDetailResponse>(
    `/recruiter/jobs/${jobId}/submit`,
  );
  return res.data.data;
}

export async function getJobAnalytics(jobId: string): Promise<JobAnalytics> {
  const res = await recruiterClient.get<{ success: boolean; data: JobAnalytics }>(
    `/recruiter/jobs/${jobId}/analytics`,
  );
  return res.data.data;
}
