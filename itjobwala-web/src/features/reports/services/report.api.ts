import apiClient from '@/src/lib/api/client';
import type { SubmitReportRequest, SubmitReportResponse } from '../types/report.types';

export async function submitReport(data: SubmitReportRequest): Promise<SubmitReportResponse> {
  const res = await apiClient.post<SubmitReportResponse>('/reports', data);
  return res.data;
}
