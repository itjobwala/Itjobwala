'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getRecruiterCompanyProfile,
  updateRecruiterCompanyProfile,
  getRecruiterPostedJobs,
  getRecruiterPostedJobById,
  createRecruiterJob,
  updateRecruiterJob,
  deleteRecruiterJob,
  getRecruiterApplicants,
  getRecruiterApplicantById,
  updateApplicantStatus,
  rejectApplicant,
  shortlistApplicant,
  hireApplicant,
} from '@/src/lib/api/recruiter';
import type {
  UpdateCompanyProfileRequest,
  CreateJobPostRequest,
  UpdateJobPostRequest,
  UpdateApplicantStatusRequest,
} from '@/src/types/recruiter';

export const recruiterKeys = {
  company: () => ['recruiter', 'company'] as const,
  jobs: () => ['recruiter', 'jobs'] as const,
  jobDetail: (id: string) => ['recruiter', 'jobs', id] as const,
  applicants: (filters?: any) => ['recruiter', 'applicants', filters] as const,
  applicantDetail: (id: string) => ['recruiter', 'applicants', id] as const,
};

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
  filters?: { page?: number; limit?: number },
  enabled = true
) {
  return useQuery({
    queryKey: recruiterKeys.jobs(),
    queryFn: () => getRecruiterPostedJobs(filters?.page, filters?.limit),
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
      qc.invalidateQueries({ queryKey: recruiterKeys.applicants() });
      qc.invalidateQueries({
        queryKey: recruiterKeys.applicantDetail(applicantId),
      });
    },
  });
}

export function useRejectApplicantMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (applicantId: string) => rejectApplicant(applicantId),
    onSuccess: (_, applicantId) => {
      qc.invalidateQueries({ queryKey: recruiterKeys.applicants() });
      qc.invalidateQueries({
        queryKey: recruiterKeys.applicantDetail(applicantId),
      });
    },
  });
}

export function useShortlistApplicantMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (applicantId: string) => shortlistApplicant(applicantId),
    onSuccess: (_, applicantId) => {
      qc.invalidateQueries({ queryKey: recruiterKeys.applicants() });
      qc.invalidateQueries({
        queryKey: recruiterKeys.applicantDetail(applicantId),
      });
    },
  });
}

export function useHireApplicantMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (applicantId: string) => hireApplicant(applicantId),
    onSuccess: (_, applicantId) => {
      qc.invalidateQueries({ queryKey: recruiterKeys.applicants() });
      qc.invalidateQueries({
        queryKey: recruiterKeys.applicantDetail(applicantId),
      });
    },
  });
}
