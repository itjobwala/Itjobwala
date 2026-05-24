import apiClient from '@/src/lib/api/client';
import { useAuthStore } from '@/src/features/auth/session/auth.store';
import type { AuthTokenResponse } from '@/src/types/api';

export interface RecruiterSignupRequest {
  full_name:       string;
  company_name:    string;
  email:           string;
  password:        string;
  phone?:          string;
  terms_accepted:  boolean;
}

export async function signupRecruiter(data: RecruiterSignupRequest): Promise<{ token?: string }> {
  const res = await apiClient.post<AuthTokenResponse>('/auth/recruiter/signup', data);
  const token = res.data.token;
  if (token) {
    useAuthStore.getState().loginRecruiter(token);
  }
  return { token };
}

export interface RecruiterSigninRequest {
  email:    string;
  password: string;
}

export async function signinRecruiter(data: RecruiterSigninRequest): Promise<void> {
  const response = await apiClient.post<AuthTokenResponse>('/auth/recruiter/signin', data);
  const token = response.data.token;
  if (!token) throw new Error('No token in response');
  useAuthStore.getState().loginRecruiter(token);
}
