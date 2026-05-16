import apiClient from './client';
import type { ApiResponse } from '@/src/types/api';
import type {
  ApplicationsListResponse,
  ApplicationDetail,
  ApplyJobRequest,
} from '@/src/types/applications';

// POST /jobs/:job_id/apply
export async function applyToJob(
  jobId: string,
  data: ApplyJobRequest = {},
): Promise<{ application_id: string }> {
  const res = await apiClient.post<ApiResponse<{ application_id: string }>>(
    `/jobs/${jobId}/apply`,
    data,
  );
  return res.data.data!;
}

// GET /candidate/applications
export async function getMyApplications(params: {
  page?:   number;
  limit?:  number;
  status?: string;
  sort?:   string;
} = {}): Promise<ApplicationsListResponse> {
  const res = await apiClient.get<ApiResponse<ApplicationsListResponse>>(
    '/candidate/applications',
    { params },
  );
  return res.data.data!;
}

// GET /candidate/applications/:application_id
export async function getApplicationDetail(
  applicationId: string,
): Promise<ApplicationDetail> {
  const res = await apiClient.get<ApiResponse<ApplicationDetail>>(
    `/candidate/applications/${applicationId}`,
  );
  return res.data.data!;
}

// DELETE /candidate/applications/:application_id
export async function withdrawApplication(applicationId: string): Promise<void> {
  await apiClient.delete<ApiResponse>(`/candidate/applications/${applicationId}`);
}
