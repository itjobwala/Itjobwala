import { publicClient, ApiError } from '@/src/lib/api/client';

type Role = 'candidate' | 'recruiter';

export class ResetCooldownError extends Error {
  retryAfterSeconds: number;
  constructor(message: string, retryAfterSeconds: number) {
    super(message);
    this.name = 'ResetCooldownError';
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

/**
 * Request a password-reset OTP.
 * Always succeeds on 200 — backend returns the same generic message whether
 * or not the account exists (no enumeration).
 */
export async function requestPasswordReset({ email, role }: { email: string; role: Role }): Promise<void> {
  try {
    await publicClient.post('/auth/forgot-password', { email, role });
  } catch (err) {
    if (err instanceof ApiError && err.status === 429) {
      const match = err.message.match(/wait\s+(\d+)\s+second/i);
      const seconds = match ? parseInt(match[1], 10) : 30;
      throw new ResetCooldownError(err.message, seconds);
    }
    throw err;
  }
}

/** Submit the 6-digit OTP + new password to complete the reset. */
export async function submitPasswordReset({
  email,
  role,
  otp,
  new_password,
}: {
  email:        string;
  role:         Role;
  otp:          string;
  new_password: string;
}): Promise<void> {
  await publicClient.post('/auth/reset-password', { email, role, otp, new_password });
}
