import { publicClient } from './client';
import apiClient from './client';
import type { ApiResponse } from '@/src/types/api';
import type { Job, JobDetail, JobsListResponse, JobFilters,JobCategory,JobCategoriesResponse } from '@/src/types/jobs';


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
  try {
    const res = await publicClient.get<ApiResponse<{ jobs: Job[] }>>('/jobs/featured');
    const jobs = res.data.data?.jobs ?? [];
    console.log('[API] getFeaturedJobs: API response received', { jobsCount: jobs.length, jobs });
    return jobs;
  } catch (error) {
    console.error('[API] getFeaturedJobs: API call failed', error);
    // Return empty array on error - don't hide the issue with mock data
    return [];
  }
}

// GET /jobs/recommended — candidate personalised
export async function getRecommendedJobs(limit = 5): Promise<Job[]> {
  const res = await apiClient.get<ApiResponse<{ jobs: Job[] }>>('/jobs/recommended', {
    params: { limit },
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
export async function getSimilarCompanies(jobId: string, limit = 5): Promise<any[]> {
  const res = await publicClient.get<any>(`/jobs/${jobId}/similar-companies`, {
    params: { limit },
  });
  return res.data.data?.companies ?? [];
}
