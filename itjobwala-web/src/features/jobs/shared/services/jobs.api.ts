import { publicClient } from '@/src/lib/api/client';
import type { ApiResponse } from '@/src/types/api';
import type { Job, JobDetail, JobsListResponse, JobFilters, JobCategory, JobCategoriesResponse } from '@/features/jobs/shared/types/apiJobs.types';

export interface SimilarCompany {
  id: string;
  name: string;
  industry: string;
  logo: string;
  open_roles: number;
  hiring_status: boolean;
}

// GET /jobs — paginated, filtered list
export async function getJobs(filters: JobFilters = {}): Promise<JobsListResponse> {
  const res = await publicClient.get<ApiResponse<JobsListResponse>>('/jobs', {
    params: filters,
  });
  return res.data.data!;
}

// GET /api/jobs/categories
export async function getJobCategories(): Promise<JobCategory[]> {
  const res = await publicClient.get<ApiResponse<JobCategoriesResponse>>(
    '/jobs/categories'
  );

  return res.data.data?.categories ?? [];
}

// GET /jobs/featured — home page jobs
export async function getFeaturedJobs(): Promise<Job[]> {
  const res = await publicClient.get<ApiResponse<{ jobs: Job[] }>>('/jobs/featured');
  return res.data.data?.jobs ?? [];
}

// GET /jobs/recommended — public newest-job recommendations
export async function getRecommendedJobs(limit = 5, exclude?: string): Promise<Job[]> {
  const res = await publicClient.get<ApiResponse<{ jobs: Job[] }>>('/jobs/recommended', {
    params: { limit, ...(exclude ? { exclude } : {}) },
  });
  return res.data.data?.jobs ?? [];
}

// GET /jobs/:job_id
export async function getJobById(jobId: string): Promise<JobDetail> {
  const res = await publicClient.get<ApiResponse<JobDetail>>(`/jobs/${jobId}`);
  return res.data.data!;
}

// GET /jobs/:job_id/similar
export async function getSimilarJobs(jobId: string, limit = 5): Promise<Job[]> {
  const res = await publicClient.get<ApiResponse<{ jobs: Job[] }>>(
    `/jobs/${jobId}/similar`,
    { params: { limit } },
  );
  return res.data.data?.jobs ?? [];
}

// GET /jobs/:job_id/similar-companies
export async function getSimilarCompanies(jobId: string, limit = 5): Promise<SimilarCompany[]> {
  const res = await publicClient.get<ApiResponse<{ companies: SimilarCompany[] }>>(`/jobs/${jobId}/similar-companies`, {
    params: { limit },
  });
  return res.data.data?.companies ?? [];
}
