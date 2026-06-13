/**
 * OTP service — single module that owns all OTP storage and verification logic.
 * Swap the storage backend here (e.g. Redis) without touching controllers.
 *
 * Config:
 *   OTP_EXPIRY_MS      10 minutes
 *   RESEND_COOLDOWN_MS 30 seconds
 *   MAX_ATTEMPTS       5
 */

import { randomInt } from 'crypto';
import bcrypt from 'bcrypt';
import knex from '../../config/db.js';
import EmailOtp from '../../models/auth/EmailOtp.js';
import { sendOtpEmail } from '../email/mailer.service.js';

const OTP_EXPIRY_MS      = 10 * 60 * 1000;
const RESEND_COOLDOWN_MS = 30 * 1000;
const MAX_ATTEMPTS       = 5;
const BCRYPT_ROUNDS      = 10;

/**
 * Generate a new OTP, hash it, upsert into email_otps, and send the email.
 * Resend overwrites the previous code and resets attempts to 0.
 *
 * @param {string} purpose  'signup' (default) or 'reset' — must not collide across purposes
 * @returns {{ last_sent_at: string, email_sent: boolean }}
 */
export async function createAndSendOtp({ email, role, name, purpose = 'signup' }) {
  const otp      = String(randomInt(100000, 1000000));
  const otp_hash = await bcrypt.hash(otp, BCRYPT_ROUNDS);
  const now      = new Date();
  const expires_at   = new Date(now.getTime() + OTP_EXPIRY_MS).toISOString();
  const last_sent_at = now.toISOString();

  // Upsert: one row per (email, role, purpose); resend overwrites entirely.
  await knex('email_otps')
    .insert({ email, role, purpose, otp_hash, expires_at, attempts: 0, last_sent_at })
    .onConflict(['email', 'role', 'purpose'])
    .merge({ otp_hash, expires_at, attempts: 0, last_sent_at });

  let email_sent = true;
  try {
    await sendOtpEmail({ to: email, otp, name });
  } catch (err) {
    // Log full error so SMTP misconfig is visible in server output.
    console.error('[otp] sendOtpEmail failed:::', err?.message ?? err);
    if (err?.code)    console.error('[otp] SMTP error code:', err.code);
    if (err?.command) console.error('[otp] SMTP command:', err.command);
    email_sent = false;
  }

  return { last_sent_at, email_sent };
}

/**
 * Verify a submitted OTP code against the stored hash.
 *
 * @param {string} purpose  'signup' (default) or 'reset'
 * @returns {{ status: 'success'|'not_found'|'expired'|'too_many_attempts'|'invalid' }}
 */
export async function checkAndVerifyOtp({ email, role, otp, purpose = 'signup' }) {
  const row = await EmailOtp.query().findOne({ email, role, purpose });

  if (!row) return { status: 'not_found' };

  if (new Date(row.expires_at) < new Date()) {
    await EmailOtp.query().deleteById(row.id);
    return { status: 'expired' };
  }

  if (row.attempts >= MAX_ATTEMPTS) {
    return { status: 'too_many_attempts' };
  }

  const isMatch = await bcrypt.compare(otp, row.otp_hash);

  if (!isMatch) {
    await EmailOtp.query().patchAndFetchById(row.id, { attempts: row.attempts + 1 });
    return { status: 'invalid' };
  }

  await EmailOtp.query().deleteById(row.id);
  return { status: 'success' };
}

/**
 * Returns the number of milliseconds remaining in the resend cooldown.
 * Returns 0 if cooldown has passed or no record exists.
 */
export async function getCooldownMs({ email, role, purpose = 'signup' }) {
  const row = await EmailOtp.query().findOne({ email, role, purpose });
  if (!row || !row.last_sent_at) return 0;
  const elapsed = Date.now() - new Date(row.last_sent_at).getTime();
  return Math.max(0, RESEND_COOLDOWN_MS - elapsed);
}

/**
 * Delete all OTP rows whose expiry has passed.
 * Called from the cleanup job.
 *
 * @returns {number} count of rows deleted
 */
export async function cleanExpiredOtps() {
  return EmailOtp.query()
    .where('expires_at', '<', new Date().toISOString())
    .delete();
}
