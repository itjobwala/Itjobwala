import apiClient from '@/src/lib/api/client';
import { useAuthStore } from '@/src/features/auth/session/auth.store';
import type { AuthTokenResponse, SignupResponse } from '@/src/types/api';

export interface RecruiterSignupRequest {
  full_name:       string;
  company_name:    string;
  email:           string;
  password:        string;
  phone?:          string;
  terms_accepted:  boolean;
}

export interface RecruiterSignupResult {
  token?:                string;
  requiresVerification?: boolean;
  email:                 string;
}

export async function signupRecruiter(data: RecruiterSignupRequest): Promise<RecruiterSignupResult> {
  const res = await apiClient.post<SignupResponse>('/auth/recruiter/signup', data);
  const { token, data: verifyData } = res.data;
  if (token) {
    useAuthStore.getState().loginRecruiter(token);
  }
  return {
    token,
    requiresVerification: verifyData?.requiresVerification,
    email:                verifyData?.email ?? data.email,
  };
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
