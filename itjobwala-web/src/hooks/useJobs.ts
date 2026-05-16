'use client';

import {
  useQuery,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import {
  getJobs,
  getFeaturedJobs,
  getRecommendedJobs,
  getJobById,
  getSimilarJobs,
  getJobCategories
} from '@/src/lib/api/jobs';
import { getHomeStats } from '@/src/lib/api/search';
import { saveJob, unsaveJob } from '@/src/lib/api/savedJobs';
import type { JobFilters } from '@/src/types/jobs';

export const jobKeys = {
  all:         () => ['jobs'] as const,
  list:        (filters: JobFilters) => ['jobs', 'list', filters] as const,
  featured:    () => ['jobs', 'featured'] as const,
  recommended: () => ['jobs', 'recommended'] as const,
  detail:      (id: string) => ['jobs', 'detail', id] as const,
  similar:     (id: string) => ['jobs', 'similar', id] as const,
};

export function useJobsQuery(filters: JobFilters = {}, enabled = true) {
  return useQuery({
    queryKey: jobKeys.list(filters),
    queryFn:  () => getJobs(filters),
    staleTime: 0,
    enabled,
  });
}

export function useJobsInfiniteQuery(baseFilters: Omit<JobFilters, 'page'> = {}) {
  return useInfiniteQuery({
    queryKey:       jobKeys.list(baseFilters),
    queryFn:        ({ pageParam = 1 }) =>
      getJobs({ ...baseFilters, page: pageParam as number }),
    initialPageParam: 1,
    getNextPageParam: (last) =>
      last.pagination.has_next ? last.pagination.page + 1 : undefined,
  });
}

export function useFeaturedJobsQuery() {
  return useQuery({
    queryKey: jobKeys.featured(),
    queryFn:  getFeaturedJobs,
    staleTime: 0,
    gcTime: 10 * 60 * 1000,
    retry: 3,
    refetchOnWindowFocus: true,
  });
}

export function useRecommendedJobsQuery(enabled = true) {
  return useQuery({
    queryKey: jobKeys.recommended(),
    queryFn:  () => getRecommendedJobs(),
    enabled,
  });
}

export function useJobDetailsQuery(jobId: string) {
  return useQuery({
    queryKey: jobKeys.detail(jobId),
    queryFn:  () => getJobById(jobId),
    enabled:  !!jobId,
  });
}

export function useSimilarJobsQuery(jobId: string) {
  return useQuery({
    queryKey: jobKeys.similar(jobId),
    queryFn:  () => getSimilarJobs(jobId),
    enabled:  !!jobId,
  });
}

export function useSaveJobMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: saveJob,
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['savedJobs'] }),
  });
}

export function useUnsaveJobMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: unsaveJob,
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['savedJobs'] }),
  });
}

export function useHomeStatsQuery() {
  return useQuery({
    queryKey: ['homeStats'],
    queryFn:  getHomeStats,
    staleTime: 5 * 60_000,
  });
}


export const jobCategoryKeys = {
  all: ['jobs'] as const,
  featured: () => [...jobCategoryKeys.all, 'featured'] as const,

  categories: () => [...jobCategoryKeys.all, 'categories'] as const,
};

export function useJobCategoriesQuery() {
  return useQuery({
    queryKey: jobCategoryKeys.categories(),
    queryFn: getJobCategories,

    staleTime: 0,
    gcTime: 10 * 60 * 1000,
    retry: 3,
    refetchOnWindowFocus: true,
  });
}