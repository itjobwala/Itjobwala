import apiClient from '@/src/lib/api/client';
import { decodeJwtPayload } from '@/src/lib/auth';
import { getInitials } from '@/src/lib/utils/format';
import { useAuthStore } from '@/src/features/auth/session/auth.store';
import type { AuthTokenResponse, SignupResponse } from '@/src/types/api';
import type { SessionUser } from '@/src/features/auth/session';

export interface CandidateSignupRequest {
  full_name:      string;
  email:          string;
  password:       string;
  mobile:         string;
  work_status:    'fresher' | 'experienced';
  terms_accepted: boolean;
}

function buildSessionUser(token: string, email: string): SessionUser {
  const payload = decodeJwtPayload(token);
  const rawName = payload?.name ? String(payload.name) : email.split('@')[0];
  const name = rawName
    .split(/[._-]/)
    .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
  return {
    email,
    name,
    initials: getInitials(name),
    role: 'Candidate',
    userRole: 'candidate',
    avatarColorClass: 'from-primary to-blue-400',
    profilePhoto: '',
    unreadNotifications: 0,
    unreadMessages: 0,
  };
}

export interface CandidateSignupResult {
  token?:                 string;
  requiresVerification?:  boolean;
  email:                  string;
}

export async function registerCandidate(data: CandidateSignupRequest): Promise<CandidateSignupResult> {
  const res = await apiClient.post<SignupResponse>('/auth/candidate/signup', data);
  const { token, data: verifyData } = res.data;
  if (token) {
    const user = buildSessionUser(token, data.email);
    useAuthStore.getState().loginCandidate(token, user);
  }
  return {
    token,
    requiresVerification: verifyData?.requiresVerification,
    email:                verifyData?.email ?? data.email,
  };
}

export interface CandidateSigninRequest {
  email:    string;
  password: string;
}

export async function signinCandidate(data: CandidateSigninRequest): Promise<void> {
  const response = await apiClient.post<AuthTokenResponse>('/auth/candidate/signin', data);
  const token = response.data.token;
  if (!token) throw new Error('No token in response');
  const user = buildSessionUser(token, data.email);
  useAuthStore.getState().loginCandidate(token, user);
}
