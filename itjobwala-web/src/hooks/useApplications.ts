'use client';

import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getMyApplications,
  getApplicationDetail,
  applyToJob,
  withdrawApplication,
} from '@/src/lib/api/applications';
import {
  getSavedJobs,
  saveJob,
  unsaveJob,
} from '@/src/lib/api/savedJobs';
import type { ApplyJobRequest } from '@/src/types/applications';

export const applicationKeys = {
  all:    () => ['applications'] as const,
  list:   (params: object) => ['applications', 'list', params] as const,
  detail: (id: string) => ['applications', 'detail', id] as const,
};

export const savedJobKeys = {
  all:  () => ['savedJobs'] as const,
  list: (params: object) => ['savedJobs', 'list', params] as const,
};

// ── Applications ──────────────────────────────────────────────────────────────

export function useMyApplicationsQuery(params: {
  page?:   number;
  limit?:  number;
  status?: string;
} = {}, enabled = true) {
  return useQuery({
    queryKey: applicationKeys.list(params),
    queryFn:  () => getMyApplications(params),
    enabled,
  });
}

export function useMyApplicationsInfiniteQuery(params: {
  limit?:  number;
  status?: string;
  sort?:   string;
} = {}, enabled = true) {
  return useInfiniteQuery({
    queryKey: ['applications', 'infinite', params],
    queryFn:  ({ pageParam = 1 }) => getMyApplications({ ...params, page: pageParam, limit: params.limit ?? 20 }),
    enabled,
    getNextPageParam: (lastPage) => {
      if (lastPage.pagination.has_next) {
        return lastPage.pagination.page + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
  });
}

export function useApplicationDetailQuery(applicationId: string) {
  return useQuery({
    queryKey: applicationKeys.detail(applicationId),
    queryFn:  () => getApplicationDetail(applicationId),
    enabled:  !!applicationId,
  });
}

export function useApplyJobMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ jobId, data }: { jobId: string; data?: ApplyJobRequest }) =>
      applyToJob(jobId, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: applicationKeys.all() }),
  });
}

export function useWithdrawApplicationMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (applicationId: string) => withdrawApplication(applicationId),
    onSuccess:  () => qc.invalidateQueries({ queryKey: applicationKeys.all() }),
  });
}

// ── Saved Jobs ────────────────────────────────────────────────────────────────

export function useSavedJobsQuery(
  params: { page?: number; limit?: number } = {},
  enabled = true,
) {
  return useQuery({
    queryKey: savedJobKeys.list(params),
    queryFn:  () => getSavedJobs(params),
    enabled,
  });
}

export function useSavedJobsInfiniteQuery(params: {
  limit?:  number;
  sort?:   string;
} = {}, enabled = true) {
  return useInfiniteQuery({
    queryKey: ['savedJobs', 'infinite', params],
    queryFn:  ({ pageParam = 1 }) => getSavedJobs({ ...params, page: pageParam, limit: params.limit ?? 20 }),
    enabled,
    getNextPageParam: (lastPage) => {
      if (lastPage.pagination.has_next) {
        return lastPage.pagination.page + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
  });
}

export function useSaveJobMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (jobId: string) => saveJob(jobId),
    onSuccess:  () => qc.invalidateQueries({ queryKey: savedJobKeys.all() }),
  });
}

export function useUnsaveJobMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (jobId: string) => unsaveJob(jobId),
    onSuccess:  () => qc.invalidateQueries({ queryKey: savedJobKeys.all() }),
  });
}
