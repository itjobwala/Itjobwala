/**
 * Token Service
 *
 * Handles:
 *  - Access token signing / verification   (via jsonwebtoken, ACCESS_TOKEN_SECRET)
 *  - Refresh token signing / verification  (via jsonwebtoken, REFRESH_TOKEN_SECRET)
 *  - SHA-256 hashing of refresh tokens     (raw token is NEVER stored in DB)
 *  - Refresh token DB lifecycle: store, lookup, revoke, cleanup
 */

import { createHash, randomBytes } from 'crypto';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import RefreshToken from '../models/auth/RefreshToken.js';

// ── Token lifetimes ───────────────────────────────────────────────────────────
const ACCESS_EXPIRES_IN  = env.accessTokenExpiresIn;   // e.g. '15m'
const REFRESH_EXPIRES_IN = env.refreshTokenExpiresIn;  // e.g. '7d'
const REFRESH_MS         = 7 * 24 * 60 * 60 * 1000;   // 7 days in ms

// ── Access token ──────────────────────────────────────────────────────────────

export function generateAccessToken({ sub, role }) {
  return jwt.sign(
    { sub: String(sub), role, type: 'access' },
    env.accessTokenSecret,
    { expiresIn: ACCESS_EXPIRES_IN, issuer: 'itjobwala' },
  );
}

export function verifyAccessToken(token) {
  const payload = jwt.verify(token, env.accessTokenSecret, { issuer: 'itjobwala' });
  if (payload.type !== 'access') throw new Error('Invalid token type');
  return payload;
}

// ── Refresh token ─────────────────────────────────────────────────────────────

export function generateRefreshToken({ sub, role }) {
  return jwt.sign(
    { sub: String(sub), role, type: 'refresh', jti: randomBytes(16).toString('hex') },
    env.refreshTokenSecret,
    { expiresIn: REFRESH_EXPIRES_IN, issuer: 'itjobwala' },
  );
}

export function verifyRefreshToken(token) {
  const payload = jwt.verify(token, env.refreshTokenSecret, {
    issuer:         'itjobwala',
    clockTolerance: 30, // 30-second clock skew tolerance
  });
  if (payload.type !== 'refresh') throw new Error('Invalid token type');
  return payload;
}

// ── Hashing ───────────────────────────────────────────────────────────────────

export function hashRefreshToken(token) {
  return createHash('sha256').update(token).digest('hex');
}

// ── DB lifecycle ──────────────────────────────────────────────────────────────

export async function storeRefreshToken({ userId, role, token, ipAddress, userAgent }) {
  const tokenHash = hashRefreshToken(token);
  const expiresAt = new Date(Date.now() + REFRESH_MS);

  await RefreshToken.query().insert({
    user_id:    Number(userId),
    role,
    token_hash: tokenHash,
    expires_at: expiresAt.toISOString(),
    ip_address: ipAddress ?? null,
    user_agent: userAgent ?? null,
  });
}

/** Find a valid (not revoked, not expired) refresh token record by raw token value. */
export async function findRefreshToken(token) {
  const tokenHash = hashRefreshToken(token);
  return RefreshToken.query()
    .findOne({ token_hash: tokenHash })
    .whereNull('revoked_at')
    .where('expires_at', '>', new Date().toISOString());
}

/** Find a refresh token record regardless of revoked/expiry (for reuse detection). */
export async function findRefreshTokenAny(token) {
  const tokenHash = hashRefreshToken(token);
  return RefreshToken.query().findOne({ token_hash: tokenHash });
}

export async function revokeRefreshToken(token) {
  const tokenHash = hashRefreshToken(token);
  await RefreshToken.query()
    .where({ token_hash: tokenHash })
    .patch({ revoked_at: new Date().toISOString() });
}

/** Revoke ALL active sessions for a user — used on token reuse detection. */
export async function revokeAllUserTokens(userId, role) {
  await RefreshToken.query()
    .where({ user_id: Number(userId), role })
    .whereNull('revoked_at')
    .patch({ revoked_at: new Date().toISOString() });
}

export async function markRefreshTokenUsed(token) {
  const tokenHash = hashRefreshToken(token);
  await RefreshToken.query()
    .where({ token_hash: tokenHash })
    .patch({ last_used_at: new Date().toISOString() });
}

// ── Cleanup ───────────────────────────────────────────────────────────────────

export async function cleanExpiredTokens() {
  const deleted = await RefreshToken.query()
    .where('expires_at', '<', new Date().toISOString())
    .delete();
  return deleted;
}
