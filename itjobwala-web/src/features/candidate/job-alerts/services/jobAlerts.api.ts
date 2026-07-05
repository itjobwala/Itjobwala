import apiClient from '@/src/lib/api/client';

export interface AlertCriteria {
  keywords?:   string | null;
  location?:   string | null;
  work_mode?:  string[];
  job_type?:   string[];
  salary_min?: number | null;
  experience?: number | null;
}

export interface AlertAPI {
  id:          string;
  name:        string;
  criteria:    AlertCriteria;
  frequency:   'instant' | 'daily' | 'weekly';
  is_active:   boolean;
  last_run_at: string | null;
  created_at:  string;
  updated_at:  string;
}

export interface CreateAlertBody {
  name:      string;
  frequency: 'instant' | 'daily' | 'weekly';
  criteria:  AlertCriteria;
}

export interface UpdateAlertBody {
  name?:      string;
  frequency?: 'instant' | 'daily' | 'weekly';
  is_active?: boolean;
  criteria?:  AlertCriteria;
}

export async function listAlerts(): Promise<AlertAPI[]> {
  const res = await apiClient.get<{ success: boolean; data: { alerts: AlertAPI[] } }>(
    '/candidate/job-alerts',
  );
  return res.data.data.alerts;
}

export async function createAlert(body: CreateAlertBody): Promise<AlertAPI> {
  const res = await apiClient.post<{ success: boolean; data: { alert: AlertAPI } }>(
    '/candidate/job-alerts',
    body,
  );
  return res.data.data.alert;
}

export async function updateAlert(alertId: string, body: UpdateAlertBody): Promise<AlertAPI> {
  const res = await apiClient.put<{ success: boolean; data: { alert: AlertAPI } }>(
    `/candidate/job-alerts/${alertId}`,
    body,
  );
  return res.data.data.alert;
}

export async function deleteAlert(alertId: string): Promise<void> {
  await apiClient.delete(`/candidate/job-alerts/${alertId}`);
}
