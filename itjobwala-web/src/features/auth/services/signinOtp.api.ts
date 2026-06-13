import { publicClient, ApiError } from '@/src/lib/api/client';
import { useAuthStore } from '@/src/features/auth/session/auth.store';
import { decodeJwtPayload } from '@/src/lib/auth';
import { getInitials } from '@/src/lib/utils/format';
import type { SessionUser } from '@/src/features/auth/session';
import { ResendCooldownError } from './otp.api';

type Role = 'candidate' | 'recruiter';

function buildCandidateSession(token: string, email: string): SessionUser {
  const payload = decodeJwtPayload(token);
  const rawName = payload?.name ? String(payload.name) : email.split('@')[0];
  const name = rawName
    .split(/[._-]/)
    .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
  return {
    email,
    name,
    initials:            getInitials(name),
    role:                'Candidate',
    userRole:            'candidate',
    avatarColorClass:    'from-primary to-blue-400',
    profilePhoto:        '',
    unreadNotifications: 0,
    unreadMessages:      0,
  };
}

export async function sendSigninOtp({ email, role }: { email: string; role: Role }): Promise<void> {
  try {
    await publicClient.post('/auth/send-signin-otp', { email, role });
  } catch (err) {
    if (err instanceof ApiError && err.status === 429) {
      const match = err.message.match(/wait\s+(\d+)\s+second/i);
      const seconds = match ? parseInt(match[1], 10) : 30;
      throw new ResendCooldownError(err.message, seconds);
    }
    throw err;
  }
}

export async function verifySigninOtpAndLogin({
  email,
  role,
  otp,
}: {
  email: string;
  role:  Role;
  otp:   string;
}): Promise<void> {
  const res = await publicClient.post<{ success: boolean; message: string; token?: string }>(
    '/auth/verify-signin-otp',
    { email, role, otp },
  );
  const token = res.data.token;
  if (!token) throw new Error(res.data.message || 'Sign in failed');

  if (role === 'candidate') {
    const user = buildCandidateSession(token, email);
    useAuthStore.getState().loginCandidate(token, user);
  } else {
    useAuthStore.getState().loginRecruiter(token);
  }
}
