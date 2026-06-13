export interface ApiResponse<T = undefined> {
  success: boolean;
  message: string;
  data?:   T;
  errors?: Record<string, string> | unknown[];
}

export interface AuthTokenResponse {
  success: boolean;
  message: string;
  token?:  string;
}

export interface SignupVerifyData {
  requiresVerification: boolean;
  email: string;
  role:  'candidate' | 'recruiter';
  email_sent: boolean;
}

export interface SignupResponse {
  success: boolean;
  message: string;
  token?:  string;
  data?:   SignupVerifyData;
}

export interface Pagination {
  page:        number;
  limit:       number;
  total:       number;
  total_pages: number;
  has_next:    boolean;
  has_prev:    boolean;
}

export interface PaginatedResponse<T> {
  items:      T[];
  pagination: Pagination;
}
