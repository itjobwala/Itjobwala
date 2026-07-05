/**
 * Refresh token flow — backend supports POST /auth/refresh.
 *
 * The refresh token lives in an httpOnly cookie (set by the backend).
 * This module never touches localStorage or JS-readable cookies.
 * axios withCredentials: true sends the httpOnly cookie automatically.
 *
 * Flow:
 *   1. App mount (cold start): SessionHydrator fires queueRefreshRequest()
 *      → if refresh cookie is valid, store is populated with token + user
 *   2. Access token expires (401 received during normal use):
 *      → same path, but store already has role/user so only accessToken is updated
 *   3. Original request retried with new token (handled in client.ts interceptor)
 */

import axios from 'axios';
import { env } from '@/src/env';

const BASE_URL = env.apiUrl;

let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;

/**
 * Call POST /auth/refresh.
 * Returns the new access token (updated in-memory store), or null if refresh fails.
 */
export async function refreshAccessToken(): Promise<string | null> {
  try {
    const res = await axios.post<{ token: string }>(
      `${BASE_URL}/auth/refresh`,
      {},
      { withCredentials: true },
    );
    const newToken = res.data?.token ?? null;

    if (newToken) {
      const { useAuthStore } = await import('./auth.store');
      const { role, user } = useAuthStore.getState();

      if (role && user) {
        // Mid-session refresh — just update the token in memory
        useAuthStore.setState({ accessToken: newToken });
      } else {
        // Cold start — decode JWT to restore role + user from scratch
        const {
          decodeJwt,
          buildCandidateUser,
          buildRecruiterUser,
          buildAdminUser,
          readSession,
        } = await import('./session.utils');

        const payload = decodeJwt(newToken);
        if (payload) {
          const newRole = String(payload.role ?? '').toLowerCase();
          if (newRole === 'candidate') {
            const stored = readSession();  // restore name/photo from localStorage
            const newUser = buildCandidateUser(payload, stored);
            useAuthStore.setState({ accessToken: newToken, user: newUser, role: 'candidate', isAuthenticated: true });
          } else if (newRole === 'recruiter') {
            const newUser = buildRecruiterUser(payload);
            useAuthStore.setState({ accessToken: newToken, user: newUser, role: 'recruiter', isAuthenticated: true });
          } else if (newRole === 'admin') {
            const newUser = buildAdminUser(payload);
            useAuthStore.setState({ accessToken: newToken, user: newUser, role: 'admin', isAuthenticated: true });
          }
        }
      }
    }

    return newToken;
  } catch {
    return null;
  }
}

/**
 * Deduplicate concurrent refresh calls.
 * Multiple 401s from simultaneous requests share the same in-flight refresh.
 */
export async function queueRefreshRequest(): Promise<string | null> {
  if (isRefreshing && refreshPromise) return refreshPromise;

  isRefreshing = true;
  refreshPromise = refreshAccessToken().finally(() => {
    isRefreshing = false;
    refreshPromise = null;
  });

  return refreshPromise;
}

/** Reset all refresh state (call after logout or on refresh failure). */
export function clearRefreshState(): void {
  isRefreshing = false;
  refreshPromise = null;
}

/**
 * Tell the backend to clear the httpOnly refresh cookie.
 * Must be called on every logout path — without this the silent-refresh on
 * the next page load would silently re-authenticate the user.
 * Fire-and-forget: store is cleared synchronously; the cookie clear is best-effort.
 */
export function revokeRefreshToken(): void {
  fetch(`${BASE_URL}/auth/logout`, {
    method: 'POST',
    credentials: 'include',
  }).catch(() => {
    // Ignore network errors — the access token is already gone from memory.
    // The refresh cookie will expire naturally after its max-age.
  });
}
