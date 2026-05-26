import apiClient from '@/src/lib/api/client';
import type { ApiResponse } from '@/src/types/api';
import type {
  ReferralJob,
  ReferralJobsResponse,
  ReferralRequest,
  ReceivedReferralRequest,
  CreateReferralJobPayload,
  ApplyReferralPayload,
  ReferralStatus,
} from '../types/referral.types';

export async function getReferralJobs(params: {
  page?:     number;
  limit?:    number;
  company?:  string;
  skills?:   string;
  location?: string;
  sort?:     'newest' | 'popular';
  mine?:     boolean;
} = {}): Promise<ReferralJobsResponse> {
  const res = await apiClient.get<ApiResponse<ReferralJobsResponse>>('/referrals/jobs', { params });
  return res.data.data!;
}

export async function createReferralJob(payload: CreateReferralJobPayload): Promise<{ id: number }> {
  const res = await apiClient.post<ApiResponse<{ id: number; job_title: string }>>('/referrals/jobs', payload);
  return res.data.data!;
}

export async function applyForReferral(id: number, payload: ApplyReferralPayload): Promise<{ id: number; status: string }> {
  const res = await apiClient.post<ApiResponse<{ id: number; status: string }>>(`/referrals/jobs/${id}/apply`, payload);
  return res.data.data!;
}

export async function getMyReferralRequests(params: {
  status?: string;
  page?:   number;
  limit?:  number;
} = {}): Promise<{ requests: ReferralRequest[]; pagination: any }> {
  const res = await apiClient.get<ApiResponse<{ requests: ReferralRequest[]; pagination: any }>>('/referrals/my-requests', { params });
  return res.data.data!;
}

export async function getReceivedReferrals(params: {
  status?: string;
  page?:   number;
  limit?:  number;
} = {}): Promise<{ requests: ReceivedReferralRequest[]; pagination: any }> {
  const res = await apiClient.get<ApiResponse<{ requests: ReceivedReferralRequest[]; pagination: any }>>('/referrals/received', { params });
  return res.data.data!;
}

export async function updateReferralStatus(
  id:         number,
  status:     ReferralStatus,
  notes?:     string,
  apply_link?: string,
): Promise<{ id: number; status: ReferralStatus }> {
  const res = await apiClient.patch<ApiResponse<{ id: number; status: ReferralStatus }>>(
    `/referrals/request/${id}/status`,
    { status, notes, apply_link },
  );
  return res.data.data!;
}

