import { recruiterClient } from '@/src/lib/api/client';
import type {
  RecruiterCompanyProfile,
  UpdateCompanyProfileRequest,
  RecruiterCompanyProfileResponse,
} from '@/features/recruiter/types';

const UPLOAD_TIMEOUT = 120_000;

export async function getRecruiterCompanyProfile(): Promise<RecruiterCompanyProfile> {
  const res = await recruiterClient.get<RecruiterCompanyProfileResponse>('/recruiter/company');
  return res.data.data;
}

export async function updateRecruiterCompanyProfile(
  data: UpdateCompanyProfileRequest,
): Promise<RecruiterCompanyProfile> {
  const res = await recruiterClient.put<RecruiterCompanyProfileResponse>(
    '/recruiter/company',
    data,
  );
  return res.data.data;
}

export async function uploadRecruiterCompanyLogo(file: File): Promise<string> {
  const fd = new FormData();
  fd.append('file', file);
  const res = await recruiterClient.post<{ success: boolean; data: { logo: string } }>(
    '/recruiter/company/logo',
    fd,
    { headers: { 'Content-Type': 'multipart/form-data' }, timeout: UPLOAD_TIMEOUT },
  );
  return res.data.data.logo;
}
