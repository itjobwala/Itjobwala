import axios, { type InternalAxiosRequestConfig } from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4001/api';

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
    const message = (
      error.response?.data?.message ??
      error.message ??
      'Something went wrong'
    ) as string;
    const apiError = new Error(message);
    (apiError as any).status = error.response?.status;
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
    const message = (
      error.response?.data?.message ??
      error.message ??
      'Something went wrong'
    ) as string;
    const apiError = new Error(message);
    (apiError as any).status = error.response?.status;
    if ((apiError as any).status === 401 && typeof window !== 'undefined') {
      window.location.href = '/recruiter/login';
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
    const message = (
      error.response?.data?.message ??
      error.message ??
      'Something went wrong'
    ) as string;
    const apiError = new Error(message);
    (apiError as any).status = error.response?.status;
    return Promise.reject(apiError);
  },
);

export default apiClient;
