import axios, { type InternalAxiosRequestConfig } from 'axios';
import { clearCandidateAuth, clearRecruiterAuth } from '@/src/lib/auth';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4001/api';

export interface ApiError extends Error {
  status?: number;
  details?: Record<string, string>;
}

function toApiError(error: unknown): ApiError {
  const isAxios = axios.isAxiosError<{ message?: string; details?: Record<string, string> }>(error);
  const message = isAxios
    ? error.response?.data?.message ?? error.message
    : error instanceof Error
      ? error.message
      : 'Something went wrong';

  const apiError: ApiError = new Error(message);
  if (isAxios) {
    apiError.status = error.response?.status;
    apiError.details = error.response?.data?.details;
  }
  return apiError;
}

// ── Candidate client (injects `token`) ───────────────────────────────────────
const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10_000,
  withCredentials: true,
});

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (res) => res,
  (error) => {
    const apiError = toApiError(error);
    if (apiError.status === 401 && typeof window !== 'undefined') {
      clearCandidateAuth();
    }
    return Promise.reject(apiError);
  },
);

// ── Recruiter client (injects `recruiter_token`) ─────────────────────────────
export const recruiterClient = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10_000,
  withCredentials: true,
});

recruiterClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('recruiter_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

recruiterClient.interceptors.response.use(
  (res) => res,
  (error) => {
    const apiError = toApiError(error);
    if (apiError.status === 401 && typeof window !== 'undefined') {
      clearRecruiterAuth();
      window.location.href = '/auth/login?role=recruiter';
    }
    return Promise.reject(apiError);
  },
);

// ── Public client (no auth) ──────────────────────────────────────────────────
export const publicClient = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10_000,
  withCredentials: true,
});

publicClient.interceptors.response.use(
  (res) => res,
  (error) => {
    const apiError = toApiError(error);
    return Promise.reject(apiError);
  },
);

export default apiClient;
