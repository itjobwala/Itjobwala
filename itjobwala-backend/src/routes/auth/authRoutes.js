import { refreshTokens, logoutUser } from '../../controllers/auth/authController.js';

export default async function authRoutes(fastify, options) {
  // POST /auth/refresh
  // Reads refresh_token httpOnly cookie, rotates token pair, returns new access token
  fastify.post(
    '/auth/refresh',
    { preValidation: [fastify.authenticateRefreshToken] },
    refreshTokens,
  );

  // POST /auth/logout
  // Revokes the refresh token session and clears the cookie
  fastify.post('/auth/logout', logoutUser);
}
