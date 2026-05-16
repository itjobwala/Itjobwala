import apiClient from './client';
import type { ApiResponse } from '@/src/types/api';
import type { SavedJobsListResponse } from '@/src/types/applications';

// GET /candidate/saved-jobs
export async function getSavedJobs(params: {
  page?:  number;
  limit?: number;
  sort?:  string;
} = {}): Promise<SavedJobsListResponse> {
  const res = await apiClient.get<ApiResponse<SavedJobsListResponse>>(
    '/candidate/saved-jobs',
    { params },
  );
  return res.data.data!;
}

// POST /candidate/saved-jobs
export async function saveJob(jobId: string): Promise<void> {
  await apiClient.post<ApiResponse>('/candidate/saved-jobs', { job_id: jobId });
}

// DELETE /candidate/saved-jobs/:job_id
export async function unsaveJob(jobId: string): Promise<void> {
  await apiClient.delete<ApiResponse>(`/candidate/saved-jobs/${jobId}`);
}
