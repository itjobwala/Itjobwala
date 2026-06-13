'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getResumes,
  createResume,
  getResume,
  updateResume,
  deleteResume,
  getPrefillContent,
} from '../services/resumeBuilder.api';
import type { ResumeContent } from '../types/resumeBuilder.types';

export const resumeKeys = {
  all:     (): readonly string[] => ['candidate', 'resumes'],
  list:    (): readonly string[] => ['candidate', 'resumes', 'list'],
  detail:  (id: number)          => ['candidate', 'resumes', id] as const,
  prefill: (): readonly string[] => ['candidate', 'resumes', 'prefill'],
};

export function useResumesQuery() {
  return useQuery({ queryKey: resumeKeys.list(), queryFn: getResumes });
}

export function useResumeQuery(id: number) {
  return useQuery({
    queryKey: resumeKeys.detail(id),
    queryFn:  () => getResume(id),
    enabled:  id > 0,
  });
}

export function usePrefillQuery(enabled = false) {
  return useQuery({
    queryKey:  resumeKeys.prefill(),
    queryFn:   getPrefillContent,
    enabled,
    staleTime: Infinity,
  });
}

export function useCreateResumeMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { title: string; template: string; content: ResumeContent }) =>
      createResume(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: resumeKeys.all() }),
  });
}

export function useUpdateResumeMutation(id: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<{ title: string; template: string; content: ResumeContent }>) =>
      updateResume(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: resumeKeys.detail(id) });
      qc.invalidateQueries({ queryKey: resumeKeys.list() });
    },
  });
}

export function useDeleteResumeMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteResume(id),
    onSuccess:  () => qc.invalidateQueries({ queryKey: resumeKeys.all() }),
  });
}
