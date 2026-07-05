'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getAdminStats,
  getAdminUsers,
  getAdminUserDetail,
  patchUserStatus,
  patchRecruiterVerify,
  getAdminJobs,
  getAdminJobQueue,
  moderateJob,
  patchJobStatus,
  getAdminReports,
  resolveAdminReport,
  getAdminActions,
  getSignupAnalytics,
  getJobsAnalytics,
  getAppAnalytics,
} from '../services/admin.api';

export const adminKeys = {
  stats:      ()                            => ['admin', 'stats'] as const,
  users:      (filters: object)             => ['admin', 'users', filters] as const,
  userDetail: (role: string, id: number)    => ['admin', 'user', role, id] as const,
  jobs:       (filters: object)             => ['admin', 'jobs', filters] as const,
  jobQueue:   (page: number)                => ['admin', 'job-queue', page] as const,
  reports:    (filters: object)             => ['admin', 'reports', filters] as const,
  actions:    (page: number)                => ['admin', 'actions', page] as const,
  analytics:  (type: string, range: string) => ['admin', 'analytics', type, range] as const,
};

export function useAdminStatsQuery() {
  return useQuery({ queryKey: adminKeys.stats(), queryFn: getAdminStats });
}

export function useAdminUsersQuery(
  params: { role?: 'candidate' | 'recruiter'; search?: string; status?: 'active' | 'suspended'; page?: number },
) {
  return useQuery({
    queryKey: adminKeys.users(params),
    queryFn:  () => getAdminUsers(params),
  });
}

export function useAdminUserDetailQuery(role: 'candidate' | 'recruiter', id: number, enabled = true) {
  return useQuery({
    queryKey: adminKeys.userDetail(role, id),
    queryFn:  () => getAdminUserDetail(role, id),
    enabled,
  });
}

export function usePatchUserStatusMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ role, id, is_active }: { role: 'candidate' | 'recruiter'; id: number; is_active: boolean }) =>
      patchUserStatus(role, id, is_active),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });
}

export function usePatchRecruiterVerifyMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, is_verified }: { id: number; is_verified: boolean }) =>
      patchRecruiterVerify(id, is_verified),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });
}

export function useAdminJobsQuery(params: { search?: string; status?: string; page?: number }) {
  return useQuery({
    queryKey: adminKeys.jobs(params),
    queryFn:  () => getAdminJobs(params),
  });
}

export function usePatchJobStatusMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => patchJobStatus(id, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'jobs'] });
    },
  });
}

export function useAdminActionsQuery(page = 1) {
  return useQuery({
    queryKey: adminKeys.actions(page),
    queryFn:  () => getAdminActions(page),
  });
}

export function useAdminJobQueueQuery(page = 1) {
  return useQuery({
    queryKey: adminKeys.jobQueue(page),
    queryFn:  () => getAdminJobQueue(page),
  });
}

export function useModerateJobMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, decision, reason }: { id: number; decision: 'approve' | 'needs_changes' | 'remove'; reason?: string }) =>
      moderateJob(id, decision, reason),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'job-queue'] });
      qc.invalidateQueries({ queryKey: ['admin', 'jobs'] });
    },
  });
}

export function useAdminReportsQuery(params: { status?: 'open' | 'resolved' | 'dismissed'; page?: number }) {
  return useQuery({
    queryKey: adminKeys.reports(params),
    queryFn:  () => getAdminReports(params),
  });
}

export function useResolveReportMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status, resolution_note }: { id: number; status: 'resolved' | 'dismissed'; resolution_note?: string }) =>
      resolveAdminReport(id, status, resolution_note),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'reports'] });
    },
  });
}

export function useSignupAnalyticsQuery(range = '30d') {
  return useQuery({
    queryKey: adminKeys.analytics('signups', range),
    queryFn:  () => getSignupAnalytics(range),
    staleTime: 5 * 60_000,
  });
}

export function useJobsAnalyticsQuery(range = '30d') {
  return useQuery({
    queryKey: adminKeys.analytics('jobs', range),
    queryFn:  () => getJobsAnalytics(range),
    staleTime: 5 * 60_000,
  });
}

export function useAppAnalyticsQuery(range = '30d') {
  return useQuery({
    queryKey: adminKeys.analytics('applications', range),
    queryFn:  () => getAppAnalytics(range),
    staleTime: 5 * 60_000,
  });
}
