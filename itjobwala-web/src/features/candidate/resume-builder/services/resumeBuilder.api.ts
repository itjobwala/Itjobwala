import apiClient from '@/src/lib/api/client';
import type { ApiResponse } from '@/src/types/api';
import type { ResumeContent, ResumeDocument, ResumeSummary } from '../types/resumeBuilder.types';

export async function getResumes(): Promise<ResumeSummary[]> {
  const res = await apiClient.get<ApiResponse<{ resumes: ResumeSummary[] }>>('/candidate/resumes');
  return res.data.data!.resumes;
}

export async function createResume(data: {
  title:    string;
  template: string;
  content:  ResumeContent;
}): Promise<ResumeDocument> {
  const res = await apiClient.post<ApiResponse<{ resume: ResumeDocument }>>('/candidate/resumes', data);
  return res.data.data!.resume;
}

export async function getResume(id: number): Promise<ResumeDocument> {
  const res = await apiClient.get<ApiResponse<{ resume: ResumeDocument }>>(`/candidate/resumes/${id}`);
  return res.data.data!.resume;
}

export async function updateResume(
  id:   number,
  data: Partial<{ title: string; template: string; content: ResumeContent }>,
): Promise<ResumeDocument> {
  const res = await apiClient.put<ApiResponse<{ resume: ResumeDocument }>>(`/candidate/resumes/${id}`, data);
  return res.data.data!.resume;
}

export async function deleteResume(id: number): Promise<void> {
  await apiClient.delete(`/candidate/resumes/${id}`);
}

export async function getPrefillContent(): Promise<ResumeContent> {
  const res = await apiClient.get<ApiResponse<{ content: ResumeContent }>>('/candidate/resumes/prefill');
  return res.data.data!.content;
}
