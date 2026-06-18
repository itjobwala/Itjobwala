'use client';

import { useState, useEffect, useCallback } from 'react';

export interface JobAlert {
  id: string;
  name: string;
  keywords: string;
  location: string;
  workModes: string[];
  jobTypes: string[];
  frequency: 'instant' | 'daily' | 'weekly';
  active: boolean;
  createdAt: string;
}

const STORAGE_KEY = 'itjobwala_job_alerts';

function load(): JobAlert[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
  } catch {
    return [];
  }
}

function save(alerts: JobAlert[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(alerts));
}

export function useJobAlerts() {
  const [alerts, setAlerts] = useState<JobAlert[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setAlerts(load());
    setHydrated(true);
  }, []);

  const create = useCallback((data: Omit<JobAlert, 'id' | 'createdAt' | 'active'>) => {
    const alert: JobAlert = {
      ...data,
      id: crypto.randomUUID(),
      active: true,
      createdAt: new Date().toISOString(),
    };
    setAlerts(prev => {
      const next = [alert, ...prev];
      save(next);
      return next;
    });
    return alert;
  }, []);

  const toggle = useCallback((id: string) => {
    setAlerts(prev => {
      const next = prev.map(a => a.id === id ? { ...a, active: !a.active } : a);
      save(next);
      return next;
    });
  }, []);

  const remove = useCallback((id: string) => {
    setAlerts(prev => {
      const next = prev.filter(a => a.id !== id);
      save(next);
      return next;
    });
  }, []);

  return { alerts, hydrated, create, toggle, remove };
}
