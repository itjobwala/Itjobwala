import apiClient from '@/src/lib/api/client';
import type { ApiResponse } from '@/src/types/api';

export interface DashboardUser {
  fullName: string;
  profilePhoto: string | null;
  profileCompletion: number;
  title: string | null;
  location: string | null;
  openToWork: boolean;
}

export interface DashboardStats {
  totalApplications: number;
  shortlisted: number;
  interviews: number;
  offers: number;
  rejected: number;
  savedJobs: number;
}

export interface RecentApplication {
  id: string;
  status: string;
  appliedAt: string;
  jobTitle: string;
  company: string;
  companyLogo: string | null;
  location: string | null;
  workMode: string | null;
}

export interface DashboardData {
  user: DashboardUser;
  stats: DashboardStats;
  recentApplications: RecentApplication[];
}

export async function fetchCandidateDashboard(): Promise<DashboardData> {
  const res = await apiClient.get<ApiResponse<DashboardData>>('/candidate/dashboard');
  return res.data.data!;
}
