export interface ApiResponse<T = undefined> {
  success: boolean;
  message: string;
  data?:   T;
  errors?: Record<string, string> | unknown[];
}

export interface ApiError {
  message: string;
  status?: number;
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
