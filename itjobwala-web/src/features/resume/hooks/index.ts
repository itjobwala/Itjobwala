'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { parseResume, getResumeInsights, matchResumeToJob } from '../services/resume.api';
import type { ParseResumePayload } from '../types/resume.types';

export const resumeKeys = {
  all:      ()          => ['resume'] as const,
  insights: ()          => ['resume', 'insights'] as const,
  match:    (id: number) => ['resume', 'match', id] as const,
};

export function useResumeInsightsQuery(enabled = true) {
  return useQuery({
    queryKey: resumeKeys.insights(),
    queryFn:  getResumeInsights,
    enabled,
    retry:    false,
    staleTime: 5 * 60 * 1000,
  });
}

export function useParseResumeMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: ParseResumePayload) => parseResume(payload),
    onSuccess:  () => qc.invalidateQueries({ queryKey: resumeKeys.all() }),
  });
}

export function useJobMatchQuery(jobId: number, enabled = true) {
  return useQuery({
    queryKey: resumeKeys.match(jobId),
    queryFn:  () => matchResumeToJob(jobId),
    enabled:  enabled && !!jobId,
    retry:    false,
    staleTime: 10 * 60 * 1000,
  });
}
