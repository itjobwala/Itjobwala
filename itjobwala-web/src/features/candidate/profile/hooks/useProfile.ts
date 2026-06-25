'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getCandidateProfile,
  getProfileCompletion,
  updateCandidateProfile,
  updateSkills,
  addExperience,
  updateExperience,
  deleteExperience,
  addEducation,
  updateEducation,
  deleteEducation,
  addCertification,
  updateCertification,
  deleteCertification,
  uploadResume,
  uploadProfilePhoto,
  uploadCertificateFile,
  uploadProfileCover,
} from '@/features/candidate/profile/services/profile.api';
import { parseResume } from '@/features/resume/services/resume.api';
import type {
  UpdateProfileRequest,
  UpdateSkillsRequest,
  AddExperienceRequest,
  AddEducationRequest,
  AddCertificationRequest,
} from '@/features/candidate/profile/types/profile.types';

export const profileKeys = {
  me:         () => ['candidate', 'profile'] as const,
  completion: () => ['candidate', 'profile-completion'] as const,
  all:        () => ['candidate'] as const,
};

export function useProfileCompletionQuery(enabled = true) {
  return useQuery({
    queryKey: profileKeys.completion(),
    queryFn:  getProfileCompletion,
    enabled,
    staleTime: 0,
  });
}

export function useCandidateProfileQuery(enabled = true) {
  return useQuery({
    queryKey: profileKeys.me(),
    queryFn:  getCandidateProfile,
    enabled,
  });
}

export function useUpdateProfileMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateProfileRequest) => updateCandidateProfile(data),
    onSuccess:  () => qc.invalidateQueries({ queryKey: profileKeys.all() }),
  });
}

export function useUpdateSkillsMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateSkillsRequest) => updateSkills(data),
    onSuccess:  () => qc.invalidateQueries({ queryKey: profileKeys.all() }),
  });
}

export function useAddExperienceMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: AddExperienceRequest) => addExperience(data),
    onSuccess:  () => qc.invalidateQueries({ queryKey: profileKeys.all() }),
  });
}

export function useUpdateExperienceMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: AddExperienceRequest }) =>
      updateExperience(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: profileKeys.all() }),
  });
}

export function useDeleteExperienceMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (expId: string) => deleteExperience(expId),
    onSuccess:  () => qc.invalidateQueries({ queryKey: profileKeys.all() }),
  });
}

export function useAddEducationMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: AddEducationRequest) => addEducation(data),
    onSuccess:  () => qc.invalidateQueries({ queryKey: profileKeys.all() }),
  });
}

export function useUpdateEducationMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: AddEducationRequest }) =>
      updateEducation(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: profileKeys.all() }),
  });
}

export function useDeleteEducationMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (eduId: string) => deleteEducation(eduId),
    onSuccess:  () => qc.invalidateQueries({ queryKey: profileKeys.all() }),
  });
}

export function useAddCertificationMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: AddCertificationRequest) => addCertification(data),
    onSuccess:  () => qc.invalidateQueries({ queryKey: profileKeys.all() }),
  });
}

export function useUpdateCertificationMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: AddCertificationRequest }) =>
      updateCertification(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: profileKeys.all() }),
  });
}

export function useDeleteCertificationMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (certId: string) => deleteCertification(certId),
    onSuccess:  () => qc.invalidateQueries({ queryKey: profileKeys.all() }),
  });
}

export function useUploadResumeMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ file, onProgress }: { file: File; onProgress?: (pct: number) => void }) =>
      uploadResume(file, onProgress),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: profileKeys.all() });
      // Fire-and-forget: parse the newly uploaded resume immediately.
      // Result is stored in DB; invalidate resume cache when done so any
      // open ATS page reflects the fresh analysis without a manual click.
      parseResume({ resume_url: data.url })
        .then(() => qc.invalidateQueries({ queryKey: ['resume'] }))
        .catch(() => {
          // Parse failed silently — user can retry manually on the resume page.
          qc.invalidateQueries({ queryKey: ['resume'] });
        });
    },
  });
}

export function useUploadProfilePhotoMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ file, onProgress }: { file: File; onProgress?: (pct: number) => void }) =>
      uploadProfilePhoto(file, onProgress),
    onSuccess: () => qc.invalidateQueries({ queryKey: profileKeys.all() }),
  });
}

export function useUploadCertificateFileMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ certId, file, onProgress }: { certId: string; file: File; onProgress?: (pct: number) => void }) =>
      uploadCertificateFile(certId, file, onProgress),
    onSuccess: () => qc.invalidateQueries({ queryKey: profileKeys.all() }),
  });
}

export function useUploadProfileCoverMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ file, onProgress }: { file: File; onProgress?: (pct: number) => void }) =>
      uploadProfileCover(file, onProgress),
    onSuccess: () => qc.invalidateQueries({ queryKey: profileKeys.all() }),
  });
}
