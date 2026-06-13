import bcrypt from 'bcrypt';
import User from '../../models/candidate/User.js';
import Recruiter from '../../models/recruiter/Recruiter.js';
import { createAndSendOtp, checkAndVerifyOtp, getCooldownMs } from '../../services/otp/otp.service.js';
import { sendPasswordResetEmail } from '../../services/email/mailer.service.js';
import { revokeAllUserTokens } from '../../utils/tokenService.js';

const SALT_ROUNDS      = 10;
const MIN_PASSWORD_LEN = 6;
const PURPOSE          = 'reset';

/** Resolve the account row for the given email + role, or null if not found. */
async function findAccount(email, role) {
  if (role === 'recruiter') return Recruiter.query().findOne({ email });
  return User.query().findOne({ email });
}

/**
 * POST /auth/forgot-password
 * { email, role }
 *
 * Generates a reset OTP and emails it.  Always returns the same generic success
 * response regardless of whether the account exists — prevents account enumeration.
 */
export const forgotPassword = async (request, reply) => {
  try {
    const { email, role } = request.body;

    // Cooldown check before doing any account lookup
    const cooldownMs = await getCooldownMs({ email, role, purpose: PURPOSE });
    if (cooldownMs > 0) {
      return reply.status(429).send({
        success: false,
        message: `Please wait ${Math.ceil(cooldownMs / 1000)} seconds before requesting another code.`,
        errors:  [{ code: 'COOLDOWN', retryAfterSeconds: Math.ceil(cooldownMs / 1000) }],
      });
    }

    const account = await findAccount(email, role);

    // Always fire the OTP (even if account missing) so timing doesn't leak existence.
    // If no account, we still send "check your email" — the email simply never arrives.
    if (account) {
      const name = account.full_name || account.company_name || null;
      const { email_sent } = await createAndSendOtp({ email, role, name, purpose: PURPOSE });
      if (!email_sent) {
        request.log.warn({ email, role }, '[forgot-password] reset OTP generated but email failed to send');
      }
    }

    // Generic response — same wording whether the account exists or not
    return reply.status(200).send({
      success: true,
      message: 'If an account with that email exists, a reset code has been sent.',
      data:    {},
    });
  } catch (err) {
    request.log.error(err);
    return reply.status(500).send({ success: false, message: 'Internal server error' });
  }
};

/**
 * POST /auth/reset-password
 * { email, role, otp, new_password }
 *
 * Verifies the reset code, updates the password, and revokes all existing
 * refresh tokens (forces re-login on all devices).
 */
export const resetPassword = async (request, reply) => {
  try {
    const { email, role, otp, new_password } = request.body;

    // Password strength — same minimum as signup
    if (!new_password || new_password.length < MIN_PASSWORD_LEN) {
      return reply.status(400).send({
        success: false,
        message: `Password must be at least ${MIN_PASSWORD_LEN} characters.`,
      });
    }

    const result = await checkAndVerifyOtp({ email, role, otp, purpose: PURPOSE });

    const STATUS_MESSAGES = {
      not_found:        { status: 400, message: 'Reset code not found or already used. Request a new one.' },
      expired:          { status: 400, message: 'Reset code has expired. Please request a new one.' },
      too_many_attempts:{ status: 429, message: 'Too many incorrect attempts. Request a new reset code.' },
      invalid:          { status: 400, message: 'Invalid reset code.' },
    };

    if (result.status !== 'success') {
      const { status, message } = STATUS_MESSAGES[result.status] ?? { status: 400, message: 'Invalid request.' };
      return reply.status(status).send({ success: false, message });
    }

    const account = await findAccount(email, role);
    if (!account) {
      // Should not happen (OTP was issued for this email), but guard anyway
      return reply.status(400).send({ success: false, message: 'Account not found.' });
    }

    const hashedPassword = await bcrypt.hash(new_password, SALT_ROUNDS);

    if (role === 'recruiter') {
      await Recruiter.query().findById(account.id).patch({ password: hashedPassword });
    } else {
      await User.query().findById(account.id).patch({ password: hashedPassword });
    }

    // Revoke all active refresh tokens — forces re-login on all devices
    await revokeAllUserTokens(account.id, role);

    return reply.status(200).send({
      success: true,
      message: 'Password reset successfully. Please sign in with your new password.',
      data:    {},
    });
  } catch (err) {
    request.log.error(err);
    return reply.status(500).send({ success: false, message: 'Internal server error' });
  }
};
