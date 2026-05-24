/**
 * Refresh token flow — backend now supports POST /auth/refresh.
 *
 * The refresh token lives in an httpOnly cookie (set by the backend).
 * This module never touches the cookie — axios withCredentials: true sends it automatically.
 *
 * Flow:
 *   1. Access token expires (401 received)
 *   2. queueRefreshRequest() — deduplicates concurrent refresh attempts
 *   3. refreshAccessToken() — POSTs /auth/refresh, gets new access token
 *   4. Zustand store updated with new token
 *   5. Original request retried with new token (handled in client.ts interceptor)
 */

import axios from 'axios';
import { env } from '@/src/env';

const BASE_URL = env.apiUrl;

let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;

/**
 * Call POST /auth/refresh.
 * The httpOnly refresh cookie is sent automatically (withCredentials: true).
 * Returns the new access token, or null if refresh fails.
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
      // Update in-memory store without full logout/redirect cycle
      const { useAuthStore } = await import('./auth.store');
      const { role, user } = useAuthStore.getState();
      if (role && user) {
        const { writeToken, setCookie } = await import('./session.utils');
        const tokenKey = role === 'candidate' ? 'token' : 'recruiter_token';
        writeToken(tokenKey, newToken);
        setCookie(tokenKey, newToken);
        useAuthStore.setState({ accessToken: newToken });
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
