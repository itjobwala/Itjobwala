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

// ── POST /auth/verify-otp ─────────────────────────────────────────────────────

export const verifyOtp = async (request, reply) => {
  const { email, role, otp } = request.body;

  try {
    const Model   = role === 'candidate' ? User : Recruiter;
    const account = await Model.query().findOne({ email });

    if (!account) {
      return reply.status(404).send({ success: false, message: 'No account found with this email.' });
    }

    if (account.email_verified) {
      return reply.status(400).send({ success: false, message: 'Email is already verified. Please sign in.' });
    }

    const { status } = await checkAndVerifyOtp({ email, role, otp });

    if (status === 'not_found') {
      return reply.status(400).send({ success: false, message: 'No pending verification found. Please request a new code.' });
    }
    if (status === 'expired') {
      return reply.status(400).send({ success: false, message: 'OTP has expired. Please request a new one.' });
    }
    if (status === 'too_many_attempts') {
      return reply.status(429).send({ success: false, message: 'Too many incorrect attempts. Please request a new OTP.' });
    }
    if (status === 'invalid') {
      return reply.status(400).send({ success: false, message: 'Invalid OTP. Please try again.' });
    }

    // Mark account verified, then issue tokens exactly as signin does.
    await Model.query().patchAndFetchById(account.id, { email_verified: true });

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
      message: 'Email verified successfully',
      token:   accessToken,
    });
  } catch (error) {
    request.server.log.error(error);
    return reply.status(500).send({ success: false, message: 'Internal server error' });
  }
};

// ── POST /auth/resend-otp ─────────────────────────────────────────────────────

export const resendOtp = async (request, reply) => {
  const { email, role } = request.body;

  try {
    const Model   = role === 'candidate' ? User : Recruiter;
    const account = await Model.query().findOne({ email });

    if (!account) {
      return reply.status(404).send({ success: false, message: 'No account found with this email.' });
    }

    if (account.email_verified) {
      return reply.status(400).send({ success: false, message: 'Email is already verified. Please sign in.' });
    }

    const cooldownMs = await getCooldownMs({ email, role });
    if (cooldownMs > 0) {
      const retryAfterSecs = Math.ceil(cooldownMs / 1000);
      return reply
        .status(429)
        .header('Retry-After', String(retryAfterSecs))
        .send({ success: false, message: `Please wait ${retryAfterSecs} seconds before requesting a new code.` });
    }

    const name = account.full_name || account.company_name;
    const { email_sent } = await createAndSendOtp({ email, role, name });

    return reply.status(200).send({
      success: true,
      message: email_sent
        ? 'Verification code sent. Please check your email.'
        : 'Code generated but email delivery failed. Try again shortly.',
      data: { email_sent },
    });
  } catch (error) {
    request.server.log.error(error);
    return reply.status(500).send({ success: false, message: 'Internal server error' });
  }
};
