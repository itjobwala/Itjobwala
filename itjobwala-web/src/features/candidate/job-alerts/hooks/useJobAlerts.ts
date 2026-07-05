'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/src/features/auth/session/auth.store';
import {
  listAlerts,
  createAlert,
  updateAlert,
  deleteAlert,
  type AlertAPI,
} from '../services/jobAlerts.api';

export interface JobAlert {
  id:        string;
  name:      string;
  keywords:  string;
  location:  string;
  workModes: string[];
  jobTypes:  string[];
  frequency: 'instant' | 'daily' | 'weekly';
  active:    boolean;
  createdAt: string;
}

function toJobAlert(raw: AlertAPI): JobAlert {
  const c = raw.criteria ?? {};
  return {
    id:        raw.id,
    name:      raw.name,
    keywords:  typeof c.keywords  === 'string' ? c.keywords  : '',
    location:  typeof c.location  === 'string' ? c.location  : '',
    workModes: Array.isArray(c.work_mode) ? c.work_mode : [],
    jobTypes:  Array.isArray(c.job_type)  ? c.job_type  : [],
    frequency: raw.frequency,
    active:    raw.is_active,
    createdAt: raw.created_at,
  };
}

const ALERTS_KEY = ['candidate', 'job-alerts'] as const;

export function useJobAlerts() {
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ALERTS_KEY,
    queryFn:  listAlerts,
    enabled:  isAuthenticated,
    select:   (data) => data.map(toJobAlert),
  });

  const createMut = useMutation({
    mutationFn: createAlert,
    onSuccess:  () => qc.invalidateQueries({ queryKey: ALERTS_KEY }),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, ...body }: { id: string } & Parameters<typeof updateAlert>[1]) =>
      updateAlert(id, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ALERTS_KEY }),
  });

  const deleteMut = useMutation({
    mutationFn: deleteAlert,
    onSuccess:  () => qc.invalidateQueries({ queryKey: ALERTS_KEY }),
  });

  const create = (data: Omit<JobAlert, 'id' | 'createdAt' | 'active'>) => {
    createMut.mutate({
      name:      data.name || data.keywords || 'All IT jobs',
      frequency: data.frequency,
      criteria: {
        keywords:  data.keywords  || null,
        location:  data.location  || null,
        work_mode: data.workModes,
        job_type:  data.jobTypes,
      },
    });
  };

  const toggle = (id: string) => {
    const current = query.data?.find(a => a.id === id);
    if (!current) return;
    updateMut.mutate({ id, is_active: !current.active });
  };

  const remove = (id: string) => {
    deleteMut.mutate(id);
  };

  return {
    alerts:   query.data ?? [],
    hydrated: !query.isLoading,
    create,
    toggle,
    remove,
  };
}
