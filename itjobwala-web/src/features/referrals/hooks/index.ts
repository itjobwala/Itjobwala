'use client';

import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import {
  getReferralJobs,
  createReferralJob,
  applyForReferral,
  getMyReferralRequests,
  getReceivedReferrals,
  updateReferralStatus,
} from '../services/referrals.api';
import type {
  CreateReferralJobPayload,
  ApplyReferralPayload,
  ReferralStatus,
} from '../types/referral.types';

export const referralKeys = {
  all:      () => ['referrals'] as const,
  jobs:     (p: object) => ['referrals', 'jobs', p] as const,
  myPosts:  () => ['referrals', 'my-posts'] as const,
  sent:     (p: object) => ['referrals', 'sent', p] as const,
  received: (p: object) => ['referrals', 'received', p] as const,
};

export function useReferralJobsQuery(params: {
  page?:     number;
  limit?:    number;
  company?:  string;
  skills?:   string;
  location?: string;
  sort?:     'newest' | 'popular';
} = {}) {
  return useQuery({
    queryKey: referralKeys.jobs(params),
    queryFn:  () => getReferralJobs(params),
  });
}

export function useReferralJobsInfiniteQuery(params: {
  limit?:    number;
  company?:  string;
  skills?:   string;
  location?: string;
  sort?:     'newest' | 'popular';
} = {}) {
  return useInfiniteQuery({
    queryKey: ['referrals', 'jobs', 'infinite', params],
    queryFn:  ({ pageParam = 1 }) => getReferralJobs({ ...params, page: pageParam }),
    getNextPageParam: last => last.pagination.has_next ? last.pagination.page + 1 : undefined,
    initialPageParam: 1,
  });
}

export function useMyReferralJobsQuery(enabled = true) {
  return useQuery({
    queryKey: referralKeys.myPosts(),
    queryFn:  () => getReferralJobs({ mine: true, limit: 50, sort: 'newest' }),
    enabled,
  });
}

export function useCreateReferralMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateReferralJobPayload) => createReferralJob(payload),
    onSuccess:  () => qc.invalidateQueries({ queryKey: referralKeys.all() }),
  });
}

export function useApplyReferralMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: ApplyReferralPayload }) =>
      applyForReferral(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: referralKeys.all() }),
  });
}

export function useMyReferralRequestsQuery(params: {
  status?: string;
  page?:   number;
  limit?:  number;
} = {}, enabled = true) {
  return useQuery({
    queryKey: referralKeys.sent(params),
    queryFn:  () => getMyReferralRequests(params),
    enabled,
  });
}

export function useReceivedReferralsQuery(params: {
  status?: string;
  page?:   number;
  limit?:  number;
} = {}, enabled = true) {
  return useQuery({
    queryKey: referralKeys.received(params),
    queryFn:  () => getReceivedReferrals(params),
    enabled,
  });
}

export function useUpdateReferralStatusMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status, notes, apply_link }: { id: number; status: ReferralStatus; notes?: string; apply_link?: string }) =>
      updateReferralStatus(id, status, notes, apply_link),
    onSuccess: () => qc.invalidateQueries({ queryKey: referralKeys.all() }),
  });
}

export function useMarkAppliedMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => updateReferralStatus(id, 'applied'),
    onSuccess:  () => qc.invalidateQueries({ queryKey: referralKeys.all() }),
  });
}
