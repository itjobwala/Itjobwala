import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

/**
 * Socket.IO middleware — validates the access token sent in handshake auth.
 * Attaches { id, role, email } to socket.user on success.
 * Calls next(error) to reject the connection on failure.
 */
export function socketAuthMiddleware(socket, next) {
  const token = socket.handshake.auth?.token;

  if (!token) {
    return next(new Error('Authentication required'));
  }

  try {
    const payload = jwt.verify(token, env.accessTokenSecret);

    // Reject refresh tokens forwarded by mistake
    if (payload.type && payload.type !== 'access') {
      return next(new Error('Invalid token type'));
    }

    // Normalize sub → id (same logic as jwt.js normalizeUser)
    const userId = payload.id !== undefined ? Number(payload.id) : Number(payload.sub);
    if (!userId) {
      return next(new Error('Invalid token payload'));
    }

    socket.user = {
      id:    userId,
      role:  payload.role ?? 'candidate',
      email: payload.email ?? null,
    };

    next();
  } catch (err) {
    next(new Error('Token verification failed'));
  }
}
