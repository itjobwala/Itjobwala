import apiClient from './client';
import { setTokenCookie, setAuth, clearTokenCookie } from '@/src/lib/auth';
import type { ApiResponse } from '@/src/types/api';

// ── Signup ────────────────────────────────────────────────────────────────────
// POST /auth/candidate/signup
// Body: { full_name, email, password, mobile }

export interface CandidateSignupRequest {
  full_name:      string;
  email:          string;
  password:       string;
  mobile:         string;
  work_status:    'fresher' | 'experienced';
  terms_accepted: boolean;
}

export async function registerCandidate(data: CandidateSignupRequest): Promise<{ token?: string }> {
  const res = await apiClient.post<any>('/auth/candidate/signup', data);
  const token = res.data.token;
  if (token) {
    localStorage.setItem('token', token);
    setTokenCookie(token);
    setAuth(data.email);
  }
  return { token };
}

// ── Signin ────────────────────────────────────────────────────────────────────
// Postman: POST /auth/candidate/signin

export interface CandidateSigninRequest {
  email:    string;
  password: string;
}

export async function signinCandidate(data: CandidateSigninRequest): Promise<void> {
  const response = await apiClient.post<any>(
    '/auth/candidate/signin',
    data,
  );
  const token = response.data.token;
  if (token) {
    localStorage.setItem('token', token);
    setTokenCookie(token);
    setAuth(data.email);
  } else {
    throw new Error('No token in response');
  }
}
