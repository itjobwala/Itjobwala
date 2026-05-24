import {
  generateAccessToken,
  generateRefreshToken,
  storeRefreshToken,
  findRefreshToken,
  findRefreshTokenAny,
  revokeRefreshToken,
  revokeAllUserTokens,
  markRefreshTokenUsed,
} from '../../utils/tokenService.js';

const REFRESH_COOKIE_NAME = 'refresh_token';
const REFRESH_COOKIE_MAX_AGE = 7 * 24 * 60 * 60; // 7 days in seconds

function setRefreshCookie(reply, token) {
  reply.setCookie(REFRESH_COOKIE_NAME, token, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path:     '/',
    maxAge:   REFRESH_COOKIE_MAX_AGE,
  });
}

function clearRefreshCookie(reply) {
  reply.clearCookie(REFRESH_COOKIE_NAME, { path: '/' });
}

// ── POST /auth/refresh ────────────────────────────────────────────────────────

export const refreshTokens = async (request, reply) => {
  const rawToken   = request.rawRefreshToken;
  const payload    = request.refreshPayload;
  const { sub: userId, role } = payload;

  try {
    // 1. Look up DB record (non-revoked, non-expired)
    const session = await findRefreshToken(rawToken);

    if (!session) {
      // Token is valid JWT but not in DB (or revoked/expired).
      // Check if it was previously valid — if so, this is REUSE — nuke all sessions.
      const anySession = await findRefreshTokenAny(rawToken);
      if (anySession) {
        request.log.warn({ userId, role }, '[auth] Refresh token reuse detected — revoking all sessions');
        await revokeAllUserTokens(userId, role);
      }
      return reply.status(401).send({ success: false, message: 'Refresh token invalid or expired' });
    }

    // 2. Rotate: revoke old token first
    await revokeRefreshToken(rawToken);

    // 3. Generate new token pair
    const newAccessToken  = generateAccessToken({ sub: userId, role });
    const newRefreshToken = generateRefreshToken({ sub: userId, role });

    // 4. Persist new refresh token hash
    await storeRefreshToken({
      userId,
      role,
      token:     newRefreshToken,
      ipAddress: request.ip,
      userAgent: request.headers['user-agent'],
    });

    // 5. Set new httpOnly refresh cookie
    setRefreshCookie(reply, newRefreshToken);

    return reply.status(200).send({
      success:     true,
      message:     'Token refreshed',
      token:       newAccessToken,  // field name kept as `token` for frontend compat
      accessToken: newAccessToken,
    });
  } catch (error) {
    request.log.error(error);
    return reply.status(500).send({ success: false, message: 'Internal server error' });
  }
};

// ── POST /auth/logout ─────────────────────────────────────────────────────────

export const logoutUser = async (request, reply) => {
  const rawToken = request.cookies?.[REFRESH_COOKIE_NAME];

  try {
    if (rawToken) {
      await revokeRefreshToken(rawToken);
    }
    clearRefreshCookie(reply);
    return reply.status(200).send({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    request.log.error(error);
    // Always clear the cookie even if DB revocation fails
    clearRefreshCookie(reply);
    return reply.status(200).send({ success: true, message: 'Logged out' });
  }
};
