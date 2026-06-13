import axios, { type InternalAxiosRequestConfig } from 'axios';
import { env } from '@/src/env';
import { SESSION_EXPIRED_EVENT } from '@/src/features/auth/components/SessionExpiredToast';
import { authLog } from '@/src/features/auth/session/auth.logger';
import { useAuthStore } from '@/src/features/auth/session/auth.store';
import { queueRefreshRequest } from '@/src/features/auth/session/refresh';
import type { ApiResponse } from '@/src/types/api';

const BASE_URL = env.apiUrl;

export class ApiError extends Error {
  status?: number;
  details?: Record<string, string>;
  constructor(message: string, status?: number, details?: Record<string, string>) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

function toApiError(error: unknown): ApiError {
  const isAxios = axios.isAxiosError<{ message?: string; details?: Record<string, string> }>(error);
  const message = isAxios
    ? error.response?.data?.message ?? error.message
    : error instanceof Error
      ? error.message
      : 'Something went wrong';

  return new ApiError(
    message,
    isAxios ? error.response?.status : undefined,
    isAxios ? error.response?.data?.details : undefined,
  );
}

export function unwrap<T>(response: ApiResponse<T>): T {
  if (response.data === undefined) throw new ApiError(response.message || 'No data in response');
  return response.data;
}

type RetryableConfig = InternalAxiosRequestConfig & { _retry?: boolean };

// ── 401 guard — prevents duplicate logout/toast/redirect storms ───────────────
let isHandling401 = false;

function handleUnauthorized(role: 'candidate' | 'recruiter'): void {
  if (isHandling401) return;
  isHandling401 = true;

  authLog('[401]', `Unauthorized response — role: ${role}`);

  // Notify UI to show toast (component in RootProvider listens for this)
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(SESSION_EXPIRED_EVENT));
  }

  const { logoutCandidate, logoutRecruiter } = useAuthStore.getState();

  if (role === 'candidate') {
    logoutCandidate();
    // ProtectedRoute handles redirect; reset guard after navigation settles
  } else {
    logoutRecruiter();
    // Delay redirect so the toast is visible before the page changes
    setTimeout(() => {
      window.location.href = '/auth/login?role=recruiter';
    }, 1500);
  }

  // Reset guard after a safe window so future sessions work correctly
  setTimeout(() => { isHandling401 = false; }, 5000);
}

type ClientOptions = {
  getToken?: () => string | null;
  on401?: () => void;
};

function makeClient({ getToken, on401 }: ClientOptions = {}) {
  const client = axios.create({
    baseURL: BASE_URL,
    headers: { 'Content-Type': 'application/json' },
    timeout: 10_000,
    withCredentials: true,
  });

  if (getToken) {
    client.interceptors.request.use((config: InternalAxiosRequestConfig) => {
      const token = getToken();
      if (token) config.headers.Authorization = `Bearer ${token}`;
      return config;
    });
  }

  client.interceptors.response.use(
    (res) => res,
    async (error) => {
      const originalRequest = error.config as RetryableConfig | undefined;
      const status = axios.isAxiosError(error) ? error.response?.status : undefined;

      if (
        status === 401 &&
        typeof window !== 'undefined' &&
        on401 &&
        originalRequest &&
        !originalRequest._retry
      ) {
        originalRequest._retry = true;

        authLog('[401]', 'Attempting token refresh before logout');
        const newToken = await queueRefreshRequest();

        if (newToken) {
          authLog('[401]', 'Refresh succeeded — retrying original request');
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return client(originalRequest);
        }

        // Refresh failed — fall back to logout + toast
        on401();
      }

      return Promise.reject(toApiError(error));
    },
  );

  return client;
}

function getStoreToken(role: 'candidate' | 'recruiter' | 'admin'): string | null {
  const state = useAuthStore.getState();
  return state.role === role ? state.accessToken : null;
}

// ── Candidate client ──────────────────────────────────────────────────────────
const apiClient = makeClient({
  getToken: () => getStoreToken('candidate'),
  on401:    () => handleUnauthorized('candidate'),
});

// ── Recruiter client ──────────────────────────────────────────────────────────
export const recruiterClient = makeClient({
  getToken: () => getStoreToken('recruiter'),
  on401:    () => handleUnauthorized('recruiter'),
});

// ── Admin client ──────────────────────────────────────────────────────────────
export const adminClient = makeClient({
  getToken: () => getStoreToken('admin'),
  on401: () => {
    if (isHandling401) return;
    isHandling401 = true;
    authLog('[401]', 'Admin session expired');
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(SESSION_EXPIRED_EVENT));
    }
    useAuthStore.getState().logoutAdmin();
    setTimeout(() => {
      window.location.href = '/admin/login';
    }, 1500);
    setTimeout(() => { isHandling401 = false; }, 5000);
  },
});

// ── Public client (no auth) ──────────────────────────────────────────────────
export const publicClient = makeClient();

export default apiClient;
