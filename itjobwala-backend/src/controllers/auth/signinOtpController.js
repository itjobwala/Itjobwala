import User from '../../models/candidate/User.js';
import Recruiter from '../../models/recruiter/Recruiter.js';
import {
  createAndSendOtp,
  checkAndVerifyOtp,
  getCooldownMs,
} from '../../services/otp/otp.service.js';
import {
  generateAccessToken,
  generateRefreshToken,
  storeRefreshToken,
} from '../../utils/tokenService.js';

const REFRESH_COOKIE_MAX_AGE = 7 * 24 * 60 * 60;

function setRefreshCookie(reply, token) {
  reply.setCookie('refresh_token', token, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path:     '/',
    maxAge:   REFRESH_COOKIE_MAX_AGE,
  });
}

// ── POST /auth/send-signin-otp ────────────────────────────────────────────────
// Sends a signin OTP to a verified account. Does NOT require a password.

export const sendSigninOtp = async (request, reply) => {
  const { email, role } = request.body;

  try {
    const Model   = role === 'candidate' ? User : Recruiter;
    const account = await Model.query().findOne({ email });

    // Cooldown check
    const cooldownMs = await getCooldownMs({ email, role });
    if (cooldownMs > 0) {
      const retryAfterSecs = Math.ceil(cooldownMs / 1000);
      return reply
        .status(429)
        .header('Retry-After', String(retryAfterSecs))
        .send({ success: false, message: `Please wait ${retryAfterSecs} seconds before requesting a new code.` });
    }

    if (account) {
      if (!account.email_verified) {
        return reply.status(403).send({
          success: false,
          message: 'Please verify your email first.',
          code:    'EMAIL_NOT_VERIFIED',
          data:    { email, role },
        });
      }

      const name = account.full_name || account.company_name;
      const { email_sent } = await createAndSendOtp({ email, role, name });

      return reply.status(200).send({
        success: true,
        message: email_sent
          ? 'Sign-in code sent. Please check your email.'
          : 'Code generated but email delivery failed. Try again shortly.',
        data: { email_sent },
      });
    }

    // Generic response if account is missing
    return reply.status(200).send({
      success: true,
      message: 'Sign-in code sent. Please check your email.',
      data: { email_sent: false },
    });
  } catch (error) {
    request.server.log.error(error);
    return reply.status(500).send({ success: false, message: 'Internal server error' });
  }
};

// ── POST /auth/verify-signin-otp ──────────────────────────────────────────────
// Verifies the signin OTP and issues access + refresh tokens.
// Does NOT touch email_verified (account must already be verified).

export const verifySigninOtp = async (request, reply) => {
  const { email, role, otp } = request.body;

  try {
    const { status } = await checkAndVerifyOtp({ email, role, otp });

    if (status === 'not_found') {
      return reply.status(400).send({ success: false, message: 'No pending code found. Please request a new one.' });
    }
    if (status === 'expired') {
      return reply.status(400).send({ success: false, message: 'Code has expired. Please request a new one.' });
    }
    if (status === 'too_many_attempts') {
      return reply.status(429).send({ success: false, message: 'Too many incorrect attempts. Please request a new code.' });
    }
    if (status === 'invalid') {
      return reply.status(400).send({ success: false, message: 'Incorrect code. Please try again.' });
    }

    const Model   = role === 'candidate' ? User : Recruiter;
    const account = await Model.query().findOne({ email });

    if (!account) {
      return reply.status(400).send({ success: false, message: 'Incorrect code. Please try again.' });
    }

    if (account.is_active === false) {
      return reply.status(403).send({
        success: false,
        message: 'Your account has been suspended. Please contact support.',
        code:    'ACCOUNT_SUSPENDED',
      });
    }

    const accessToken  = generateAccessToken({ sub: account.id, role });
    const refreshToken = generateRefreshToken({ sub: account.id, role });

    await storeRefreshToken({
      userId:    account.id,
      role,
      token:     refreshToken,
      ipAddress: request.ip,
      userAgent: request.headers['user-agent'],
    });

    setRefreshCookie(reply, refreshToken);

    return reply.status(200).send({
      success: true,
      message: 'Signed in successfully',
      token:   accessToken,
    });
  } catch (error) {
    request.server.log.error(error);
    return reply.status(500).send({ success: false, message: 'Internal server error' });
  }
};
