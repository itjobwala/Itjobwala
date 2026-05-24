'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getRecruiterCompanyProfile, updateRecruiterCompanyProfile } from '@/features/recruiter/company';
import { getRecruiterPostedJobs, getRecruiterPostedJobById, createRecruiterJob, updateRecruiterJob, deleteRecruiterJob } from '@/features/recruiter/jobs';
import { getRecruiterApplicants, getRecruiterApplicantById, updateApplicantStatus, rejectApplicant, shortlistApplicant, hireApplicant } from '@/features/recruiter/applicants';
import { getRecruiterStats, getRecruiterNotifications, getRecruiterNotificationsPaged, markNotificationRead, markAllNotificationsRead } from '@/features/recruiter/dashboard';
import { getRecruiterInterviews, scheduleRecruiterInterview } from '@/features/recruiter/interviews';
import type {
  UpdateCompanyProfileRequest,
  CreateJobPostRequest,
  UpdateJobPostRequest,
  UpdateApplicantStatusRequest,
  ScheduleInterviewRequest,
} from '@/features/recruiter/types';

export const recruiterKeys = {
  company: () => ['recruiter', 'company'] as const,
  stats: () => ['recruiter', 'stats'] as const,
  jobs: () => ['recruiter', 'jobs'] as const,
  jobDetail: (id: string) => ['recruiter', 'jobs', id] as const,
  applicantsAll: () => ['recruiter', 'applicants'] as const,
  applicants: (filters?: any) => ['recruiter', 'applicants', filters] as const,
  applicantDetail: (id: string) => ['recruiter', 'applicants', 'detail', id] as const,
  interviews: () => ['recruiter', 'interviews'] as const,
  notifications: () => ['recruiter', 'notifications'] as const,
};

export function useRecruiterStatsQuery(enabled = true) {
  return useQuery({
    queryKey: recruiterKeys.stats(),
    queryFn: getRecruiterStats,
    enabled,
  });
}

// Company Profile Queries
export function useRecruiterCompanyProfileQuery(enabled = true) {
  return useQuery({
    queryKey: recruiterKeys.company(),
    queryFn: getRecruiterCompanyProfile,
    enabled,
  });
}

export function useUpdateCompanyProfileMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateCompanyProfileRequest) =>
      updateRecruiterCompanyProfile(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: recruiterKeys.company() });
    },
  });
}

// Posted Jobs Queries
export function useRecruiterPostedJobsQuery(
  filters?: { page?: number; limit?: number; status?: string; search?: string },
  enabled = true
) {
  return useQuery({
    queryKey: [...recruiterKeys.jobs(), filters] as const,
    queryFn: () => getRecruiterPostedJobs(filters),
    enabled,
  });
}

export function useRecruiterPostedJobDetailQuery(jobId: string, enabled = true) {
  return useQuery({
    queryKey: recruiterKeys.jobDetail(jobId),
    queryFn: () => getRecruiterPostedJobById(jobId),
    enabled,
  });
}

export function useCreateRecruiterJobMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateJobPostRequest) => createRecruiterJob(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: recruiterKeys.jobs() });
    },
  });
}

export function useUpdateRecruiterJobMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      jobId,
      data,
    }: {
      jobId: string;
      data: UpdateJobPostRequest;
    }) => updateRecruiterJob(jobId, data),
    onSuccess: (_, { jobId }) => {
      qc.invalidateQueries({ queryKey: recruiterKeys.jobs() });
      qc.invalidateQueries({ queryKey: recruiterKeys.jobDetail(jobId) });
    },
  });
}

export function useDeleteRecruiterJobMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (jobId: string) => deleteRecruiterJob(jobId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: recruiterKeys.jobs() });
    },
  });
}

// Applicants Queries
export function useRecruiterApplicantsQuery(
  filters?: {
    jobId?: string;
    status?: string;
    page?: number;
    limit?: number;
  },
  enabled = true
) {
  return useQuery({
    queryKey: recruiterKeys.applicants(filters),
    queryFn: () => getRecruiterApplicants(filters),
    enabled,
  });
}

export function useRecruiterApplicantDetailQuery(
  applicantId: string,
  enabled = true
) {
  return useQuery({
    queryKey: recruiterKeys.applicantDetail(applicantId),
    queryFn: () => getRecruiterApplicantById(applicantId),
    enabled,
  });
}

export function useUpdateApplicantStatusMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      applicantId,
      data,
    }: {
      applicantId: string;
      data: UpdateApplicantStatusRequest;
    }) => updateApplicantStatus(applicantId, data),
    onSuccess: (_, { applicantId }) => {
      qc.invalidateQueries({ queryKey: recruiterKeys.applicantsAll() });
      qc.invalidateQueries({ queryKey: recruiterKeys.applicantDetail(applicantId) });
      qc.invalidateQueries({ queryKey: recruiterKeys.stats() });
    },
  });
}

export function useRejectApplicantMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (applicantId: string) => rejectApplicant(applicantId),
    onSuccess: (_, applicantId) => {
      qc.invalidateQueries({ queryKey: recruiterKeys.applicantsAll() });
      qc.invalidateQueries({ queryKey: recruiterKeys.applicantDetail(applicantId) });
      qc.invalidateQueries({ queryKey: recruiterKeys.stats() });
    },
  });
}

export function useShortlistApplicantMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (applicantId: string) => shortlistApplicant(applicantId),
    onSuccess: (_, applicantId) => {
      qc.invalidateQueries({ queryKey: recruiterKeys.applicantsAll() });
      qc.invalidateQueries({ queryKey: recruiterKeys.applicantDetail(applicantId) });
      qc.invalidateQueries({ queryKey: recruiterKeys.stats() });
    },
  });
}

export function useRecruiterInterviewsQuery(enabled = true) {
  return useQuery({
    queryKey: recruiterKeys.interviews(),
    queryFn: getRecruiterInterviews,
    enabled,
  });
}

export function useScheduleInterviewMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: ScheduleInterviewRequest) => scheduleRecruiterInterview(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: recruiterKeys.interviews() });
    },
  });
}

export function useRecruiterNotificationsQuery(limit = 10, enabled = true) {
  return useQuery({
    queryKey: recruiterKeys.notifications(),
    queryFn: () => getRecruiterNotifications(limit),
    enabled,
  });
}

export function useRecruiterNotificationsPagedQuery(page = 1, limit = 20, enabled = true) {
  return useQuery({
    queryKey: [...recruiterKeys.notifications(), page, limit] as const,
    queryFn: () => getRecruiterNotificationsPaged(page, limit),
    enabled,
  });
}

export function useMarkNotificationReadMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => markNotificationRead(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: recruiterKeys.notifications() });
    },
  });
}

export function useMarkAllNotificationsReadMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => markAllNotificationsRead(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: recruiterKeys.notifications() });
    },
  });
}

export function useHireApplicantMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (applicantId: string) => hireApplicant(applicantId),
    onSuccess: (_, applicantId) => {
      qc.invalidateQueries({ queryKey: recruiterKeys.applicantsAll() });
      qc.invalidateQueries({ queryKey: recruiterKeys.applicantDetail(applicantId) });
      qc.invalidateQueries({ queryKey: recruiterKeys.stats() });
    },
  });
}
