import apiClient from './client';
import type { ApiResponse } from '@/src/types/api';
import type {
  CandidateProfile,
  UpdateProfileRequest,
  UpdateSkillsRequest,
  AddExperienceRequest,
  AddEducationRequest,
  AddCertificationRequest,
  UpdateRecruiterVisibilityRequest,
  RecruiterVisibilityResponse,
  ProfileCompletionData,
} from '@/src/types/profile';

// GET /candidate/profile
export async function getCandidateProfile(): Promise<CandidateProfile> {
  const res = await apiClient.get<ApiResponse<CandidateProfile>>('/candidate/profile');
  return res.data.data!;
}

// PUT /candidate/profile
export async function updateCandidateProfile(
  data: UpdateProfileRequest,
): Promise<void> {
  await apiClient.put<ApiResponse>('/candidate/profile', data);
}

// PUT /candidate/profile/skills
export async function updateSkills(data: UpdateSkillsRequest): Promise<void> {
  await apiClient.put<ApiResponse>('/candidate/profile/skills', data);
}

// POST /candidate/profile/experience
export async function addExperience(data: AddExperienceRequest): Promise<void> {
  await apiClient.post<ApiResponse>('/candidate/profile/experience', data);
}

// PUT /candidate/profile/experience/:exp_id
export async function updateExperience(
  expId: string,
  data: AddExperienceRequest,
): Promise<void> {
  await apiClient.put<ApiResponse>(`/candidate/profile/experience/${expId}`, data);
}

// DELETE /candidate/profile/experience/:exp_id
export async function deleteExperience(expId: string): Promise<void> {
  await apiClient.delete<ApiResponse>(`/candidate/profile/experience/${expId}`);
}

// POST /candidate/profile/education
export async function addEducation(data: AddEducationRequest): Promise<void> {
  await apiClient.post<ApiResponse>('/candidate/profile/education', data);
}

// PUT /candidate/profile/education/:edu_id
export async function updateEducation(
  eduId: string,
  data: AddEducationRequest,
): Promise<void> {
  await apiClient.put<ApiResponse>(`/candidate/profile/education/${eduId}`, data);
}

// DELETE /candidate/profile/education/:edu_id
export async function deleteEducation(eduId: string): Promise<void> {
  await apiClient.delete<ApiResponse>(`/candidate/profile/education/${eduId}`);
}

// POST /candidate/profile/certifications
export async function addCertification(
  data: AddCertificationRequest,
): Promise<void> {
  await apiClient.post<ApiResponse>('/candidate/profile/certifications', data);
}

// PUT /candidate/profile/certifications/:cert_id
export async function updateCertification(
  certId: string,
  data: AddCertificationRequest,
): Promise<void> {
  await apiClient.put<ApiResponse>(`/candidate/profile/certifications/${certId}`, data);
}

// DELETE /candidate/profile/certifications/:cert_id
export async function deleteCertification(certId: string): Promise<void> {
  await apiClient.delete<ApiResponse>(`/candidate/profile/certifications/${certId}`);
}

const UPLOAD_TIMEOUT = 120_000; // 2 min — Cloudinary uploads can be slow

// POST /candidate/profile/resume  (multipart, field: file)
export async function uploadResume(
  file: File,
  onProgress?: (pct: number) => void,
): Promise<{ file_name: string; url: string; uploaded_at: string }> {
  const form = new FormData();
  form.append('file', file);
  const res = await apiClient.post<ApiResponse<{ file_name: string; url: string; uploaded_at: string }>>(
    '/candidate/profile/resume',
    form,
    {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: UPLOAD_TIMEOUT,
      onUploadProgress: (e) => {
        if (onProgress && e.total) onProgress(Math.round((e.loaded * 100) / e.total));
      },
    },
  );
  return res.data.data!;
}

// POST /candidate/profile/photo  (multipart, field: file)
export async function uploadProfilePhoto(
  file: File,
  onProgress?: (pct: number) => void,
): Promise<{ url: string }> {
  const form = new FormData();
  form.append('file', file);
  const res = await apiClient.post<ApiResponse<{ url: string }>>(
    '/candidate/profile/photo',
    form,
    {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: UPLOAD_TIMEOUT,
      onUploadProgress: (e) => {
        if (onProgress && e.total) onProgress(Math.round((e.loaded * 100) / e.total));
      },
    },
  );
  return res.data.data!;
}

// POST /candidate/profile/certifications/:cert_id/upload  (multipart, field: file)
export async function uploadCertificateFile(
  certId: string,
  file: File,
  onProgress?: (pct: number) => void,
): Promise<{ file_name: string; url: string; uploaded_at: string }> {
  const form = new FormData();
  form.append('file', file);
  const res = await apiClient.post<ApiResponse<{ file_name: string; url: string; uploaded_at: string }>>(
    `/candidate/profile/certifications/${certId}/upload`,
    form,
    {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: UPLOAD_TIMEOUT,
      onUploadProgress: (e) => {
        if (onProgress && e.total) onProgress(Math.round((e.loaded * 100) / e.total));
      },
    },
  );
  return res.data.data!;
}

// POST /candidate/profile/cover  (multipart, field: file)
export async function uploadProfileCover(
  file: File,
  onProgress?: (pct: number) => void,
): Promise<{ url: string }> {
  const form = new FormData();
  form.append('file', file);
  const res = await apiClient.post<ApiResponse<{ url: string }>>(
    '/candidate/profile/cover',
    form,
    {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: UPLOAD_TIMEOUT,
      onUploadProgress: (e) => {
        if (onProgress && e.total) onProgress(Math.round((e.loaded * 100) / e.total));
      },
    },
  );
  return res.data.data!;
}

// GET /candidate/profile/recruiter-visibility
export async function getRecruiterVisibility(): Promise<RecruiterVisibilityResponse> {
  const res = await apiClient.get<{
    success: boolean;
    message: string;
    data: RecruiterVisibilityResponse;
  }>('/candidate/profile/recruiter-visibility');
  return res.data.data;
}

// PUT /candidate/profile/recruiter-visibility
export async function updateRecruiterVisibility(
  data: UpdateRecruiterVisibilityRequest,
): Promise<RecruiterVisibilityResponse> {
  const res = await apiClient.put<{
    success: boolean;
    message: string;
    data: RecruiterVisibilityResponse;
  }>('/candidate/profile/recruiter-visibility', data);
  return res.data.data;
}

// GET /candidate/profile/completion
export async function getProfileCompletion(): Promise<ProfileCompletionData> {
  const res = await apiClient.get<{
    success: boolean;
    message: string;
    data: ProfileCompletionData;
  }>('/candidate/profile/completion');
  return res.data.data;
}
