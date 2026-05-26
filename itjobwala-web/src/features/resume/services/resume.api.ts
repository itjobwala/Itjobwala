import apiClient from '@/src/lib/api/client';
import type { ApiResponse } from '@/src/types/api';
import type { ResumeInsights, JobMatchResult, ParseResumePayload } from '../types/resume.types';

export async function parseResume(payload: ParseResumePayload = {}): Promise<ResumeInsights> {
  const res = await apiClient.post<ApiResponse<ResumeInsights>>('/resume/parse', payload);
  return res.data.data!;
}

export async function getResumeInsights(): Promise<ResumeInsights> {
  const res = await apiClient.get<ApiResponse<ResumeInsights>>('/resume/insights');
  return res.data.data!;
}

export async function matchResumeToJob(jobId: number): Promise<JobMatchResult> {
  const res = await apiClient.post<ApiResponse<JobMatchResult>>(`/resume/match-job/${jobId}`);
  return res.data.data!;
}
