import { refreshTokens, logoutUser } from '../../controllers/auth/authController.js';
import { verifyOtp, resendOtp } from '../../controllers/auth/otpController.js';
import { sendSigninOtp, verifySigninOtp } from '../../controllers/auth/signinOtpController.js';
import { forgotPassword, resetPassword } from '../../controllers/auth/forgotPasswordController.js';

const emailRoleSchema = {
  body: {
    type: 'object',
    required: ['email', 'role'],
    properties: {
      email: { type: 'string', format: 'email' },
      role:  { type: 'string', enum: ['candidate', 'recruiter'] },
    },
  },
};

const verifyOtpSchema = {
  body: {
    type: 'object',
    required: ['email', 'role', 'otp'],
    properties: {
      email: { type: 'string', format: 'email' },
      role:  { type: 'string', enum: ['candidate', 'recruiter'] },
      otp:   { type: 'string', pattern: '^\\d{6}$' },
    },
  },
};

export default async function authRoutes(fastify, options) {
  // POST /auth/refresh
  fastify.post(
    '/auth/refresh',
    { preValidation: [fastify.authenticateRefreshToken] },
    refreshTokens,
  );

  // POST /auth/logout
  fastify.post('/auth/logout', logoutUser);

  // POST /auth/verify-otp  — email verification on signup
  fastify.post('/auth/verify-otp', {
    schema: verifyOtpSchema,
    config: { rateLimit: { max: 10, timeWindow: '5 minutes' } },
  }, verifyOtp);

  // POST /auth/resend-otp  — resend signup verification code
  fastify.post('/auth/resend-otp', {
    schema: emailRoleSchema,
    config: { rateLimit: { max: 3, timeWindow: '10 minutes' } },
  }, resendOtp);

  // POST /auth/send-signin-otp  — send OTP to a verified account for passwordless signin
  fastify.post('/auth/send-signin-otp', {
    schema: emailRoleSchema,
    config: { rateLimit: { max: 5, timeWindow: '10 minutes' } },
  }, sendSigninOtp);

  // POST /auth/verify-signin-otp  — verify OTP and issue tokens (passwordless signin)
  fastify.post('/auth/verify-signin-otp', {
    schema: verifyOtpSchema,
    config: { rateLimit: { max: 10, timeWindow: '5 minutes' } },
  }, verifySigninOtp);

  // POST /auth/forgot-password  — request a password-reset OTP
  fastify.post('/auth/forgot-password', {
    schema: emailRoleSchema,
    config: { rateLimit: { max: 3, timeWindow: '10 minutes' } },
  }, forgotPassword);

  // POST /auth/reset-password  — submit OTP + new password
  fastify.post('/auth/reset-password', {
    schema: {
      body: {
        type: 'object',
        required: ['email', 'role', 'otp', 'new_password'],
        properties: {
          email:        { type: 'string', format: 'email' },
          role:         { type: 'string', enum: ['candidate', 'recruiter'] },
          otp:          { type: 'string', pattern: '^\\d{6}$' },
          new_password: { type: 'string', minLength: 1 },
        },
      },
    },
    config: { rateLimit: { max: 5, timeWindow: '5 minutes' } },
  }, resetPassword);
}
