/**
 * Cleanup job — removes expired and old revoked refresh tokens from the DB.
 *
 * Run manually, or wire into a cron-like scheduler (node-cron, Render cron, etc.)
 *
 * Usage:
 *   node src/utils/cleanupJob.js               (one-shot)
 *   setInterval(runCleanup, 24 * 60 * 60_000)  (daily, from server.js)
 */
import { cleanExpiredTokens } from './tokenService.js';
import RefreshToken from '../models/auth/RefreshToken.js';
import { cleanExpiredOtps } from '../services/otp/otp.service.js';

export async function runCleanup(log) {
  const logger = log ?? console;
  try {
    // Delete expired sessions
    const expired = await cleanExpiredTokens();

    // Also delete revoked tokens older than 30 days (safe to purge)
    const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const revoked = await RefreshToken.query()
      .whereNotNull('revoked_at')
      .where('revoked_at', '<', cutoff)
      .delete();

    // Delete expired OTP rows
    const expiredOtps = await cleanExpiredOtps();

    logger.info?.(`[cleanup] Removed ${expired} expired + ${revoked} old revoked refresh tokens + ${expiredOtps} expired OTPs`);
    return { expired, revoked, expiredOtps };
  } catch (err) {
    logger.error?.({ err }, '[cleanup] Cleanup failed');
    return { expired: 0, revoked: 0, expiredOtps: 0 };
  }
}
