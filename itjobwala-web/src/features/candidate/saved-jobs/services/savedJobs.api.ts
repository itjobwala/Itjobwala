import apiClient from '@/src/lib/api/client';
import type { ApiResponse } from '@/src/types/api';
import type { SavedJobsListResponse } from '@/features/candidate/applications';

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

export async function saveJob(jobId: string): Promise<void> {
  await apiClient.post<ApiResponse>('/candidate/saved-jobs', { job_id: jobId });
}

export async function unsaveJob(jobId: string): Promise<void> {
  await apiClient.delete<ApiResponse>(`/candidate/saved-jobs/${jobId}`);
}
