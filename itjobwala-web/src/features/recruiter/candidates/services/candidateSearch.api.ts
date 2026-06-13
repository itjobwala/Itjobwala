import { recruiterClient } from '@/src/lib/api/client';
import type { ApiResponse } from '@/src/types/api';
import type { CandidateSearchFilters, CandidateSearchResult, CandidateDetail } from '../types/candidateSearch.types';

export async function searchCandidates(filters: CandidateSearchFilters = {}): Promise<CandidateSearchResult> {
  const res = await recruiterClient.get<ApiResponse<CandidateSearchResult>>(
    '/recruiter/candidates/search',
    { params: filters },
  );
  return res.data.data!;
}

export async function getCandidateProfile(id: string): Promise<CandidateDetail> {
  const res = await recruiterClient.get<ApiResponse<CandidateDetail>>(
    `/recruiter/candidates/${id}`,
  );
  return res.data.data!;
}
