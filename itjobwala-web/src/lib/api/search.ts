import { publicClient } from './client';
import type { ApiResponse } from '@/src/types/api';
import type { Job } from '@/src/types/jobs';

export interface SearchSuggestions {
  jobs:      { id: string; title: string; company: string; location: string }[];
  companies: { id: string; name: string; logo?: string; industry?: string; open_positions?: number }[];
  skills:    string[];
}

// GET /search?q=&location=
export async function globalSearch(q: string, location?: string): Promise<SearchSuggestions> {
  const res = await publicClient.get<ApiResponse<SearchSuggestions>>('/search', {
    params: { q, location },
  });
  return res.data.data ?? { jobs: [], companies: [], skills: [] };
}

// GET /search/suggestions?q=  (navbar autocomplete)
export async function getSearchSuggestions(q: string): Promise<SearchSuggestions> {
  const res = await publicClient.get<ApiResponse<SearchSuggestions>>(
    '/search/suggestions',
    { params: { q } },
  );
  return res.data.data ?? { jobs: [], companies: [], skills: [] };
}

// GET /search/companies
export async function getTopCompanies(): Promise<{ id: string; name: string; logo?: string }[]> {
  const res = await publicClient.get<ApiResponse<{ companies: { id: string; name: string; logo?: string }[] }>>(
    '/search/companies',
  );
  return res.data.data?.companies ?? [];
}

// GET /companies/:company_id
export async function getCompanyById(companyId: string): Promise<unknown> {
  const res = await publicClient.get<ApiResponse>(`/companies/${companyId}`);
  return res.data.data;
}

// GET /companies/:company_id/jobs
export async function getCompanyJobs(companyId: string): Promise<Job[]> {
  const res = await publicClient.get<ApiResponse<{ jobs: Job[] }>>(
    `/companies/${companyId}/jobs`,
  );
  return res.data.data?.jobs ?? [];
}

// GET /home/stats  (Postman uses /home/stats, not /stats)
export async function getHomeStats(): Promise<Record<string, number>> {
  const res = await publicClient.get<ApiResponse<Record<string, number>>>('/home/stats');
  return res.data.data ?? {};
}
