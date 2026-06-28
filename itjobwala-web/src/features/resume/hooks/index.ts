'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { parseResume, getResumeInsights, matchResumeToJob, getJobFitAnalysis, getMarketIntelligence, getLearningIntelligence, getResumeProgress, getResumeHiringSignals, getBenchmarking, getWeightEngine, getSemanticMatch, getBehavioralHireability } from '../services/resume.api';
import type { ParseResumePayload } from '../types/resume.types';

export const resumeKeys = {
  all:             ()          => ['resume'] as const,
  insights:        ()          => ['resume', 'insights'] as const,
  match:           (id: number) => ['resume', 'match', id] as const,
  jobFit:          (id: number) => ['resume', 'job-fit', id] as const,
  market:          ()          => ['intelligence', 'market'] as const,
  learning:        ()          => ['intelligence', 'learning'] as const,
  progress:        ()          => ['resume', 'progress'] as const,
  hiringSignals:   ()          => ['resume', 'hiring-signals'] as const,
  benchmarking:    ()          => ['intelligence', 'benchmarking'] as const,
  weights:         ()          => ['intelligence', 'weights'] as const,
  semanticMatch:   (id: number) => ['resume', 'semantic-match', id] as const,
  behavioral:      ()           => ['resume', 'behavioral-hireability'] as const,
};

export function useResumeInsightsQuery(enabled = true) {
  return useQuery({
    queryKey:   resumeKeys.insights(),
    queryFn:    ({ signal }) => getResumeInsights(signal),
    enabled,
    retry:      1,
    retryDelay: 1500,
    staleTime:  5 * 60 * 1000,
  });
}

export function useParseResumeMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: ParseResumePayload) => parseResume(payload),
    onSuccess:  () => {
      // Always invalidate — non-QA results are now stored in DB,
      // so the insights query reflects the correct eligible state on refetch.
      qc.invalidateQueries({ queryKey: resumeKeys.all() });
    },
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

export function useJobFitQuery(jobId: number, enabled = true) {
  return useQuery({
    queryKey: resumeKeys.jobFit(jobId),
    queryFn:  () => getJobFitAnalysis(jobId),
    enabled:  enabled && !!jobId,
    retry:    false,
    staleTime: 10 * 60 * 1000,
  });
}

export function useMarketIntelligenceQuery(enabled = true) {
  return useQuery({
    queryKey: resumeKeys.market(),
    queryFn:  getMarketIntelligence,
    enabled,
    retry:    false,
    staleTime: 60 * 60 * 1000, // 1 hour — matches backend cache TTL
  });
}

export function useLearningIntelligenceQuery(enabled = true) {
  return useQuery({
    queryKey: resumeKeys.learning(),
    queryFn:  getLearningIntelligence,
    enabled,
    retry:    false,
    staleTime: 10 * 60 * 1000,
  });
}

export function useResumeProgressQuery(enabled = true) {
  return useQuery({
    queryKey: resumeKeys.progress(),
    queryFn:  getResumeProgress,
    enabled,
    retry:    false,
    staleTime: 2 * 60 * 1000,
  });
}

export function useHiringSignalsQuery(enabled = true) {
  return useQuery({
    queryKey: resumeKeys.hiringSignals(),
    queryFn:  getResumeHiringSignals,
    enabled,
    retry:    false,
    staleTime: 5 * 60 * 1000,
  });
}

export function useBenchmarkingQuery(enabled = true) {
  return useQuery({
    queryKey: resumeKeys.benchmarking(),
    queryFn:  getBenchmarking,
    enabled,
    retry:    false,
    staleTime: 15 * 60 * 1000,
  });
}

export function useWeightEngineQuery(enabled = true) {
  return useQuery({
    queryKey: resumeKeys.weights(),
    queryFn:  getWeightEngine,
    enabled,
    retry:    false,
    staleTime: 10 * 60 * 1000,
  });
}

export function useBehavioralHireabilityQuery(enabled = true) {
  return useQuery({
    queryKey: resumeKeys.behavioral(),
    queryFn:  getBehavioralHireability,
    enabled,
    retry:    false,
    staleTime: 10 * 60 * 1000,
  });
}

export function useSemanticMatchQuery(jobId: number, enabled = true) {
  return useQuery({
    queryKey: resumeKeys.semanticMatch(jobId),
    queryFn:  () => getSemanticMatch(jobId),
    enabled:  enabled && !!jobId,
    retry:    false,
    staleTime: 10 * 60 * 1000,
  });
}
