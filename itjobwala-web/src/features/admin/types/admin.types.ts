export interface AdminStats {
  total_candidates:   number;
  total_recruiters:   number;
  total_jobs:         number;
  active_jobs:        number;
  total_applications: number;
  total_interviews:   number;
  new_candidates_7d:  number;
  new_recruiters_7d:  number;
}

export interface AdminCandidate {
  id: number;
  full_name: string;
  email: string;
  mobile: string;
  location: string | null;
  title: string | null;
  work_status: string;
  profile_completion: number;
  open_to_work: boolean;
  profile_photo_url: string | null;
  is_active: boolean;
  email_verified: boolean;
  created_at: string;
  app_count?: number;
}

export interface AdminRecruiter {
  id: number;
  full_name: string;
  company_name: string;
  email: string;
  industry: string | null;
  company_type: string | null;
  location: string | null;
  is_active: boolean;
  is_verified: boolean;
  email_verified: boolean;
  created_at: string;
  job_count?: number;
}

export type AdminUser = AdminCandidate | AdminRecruiter;

export interface AdminJob {
  id: number;
  title: string;
  company_name: string;
  location: string;
  job_type: string;
  status: string;
  created_at: string;
  poster_name: string | null;
  poster_email: string | null;
}

export interface AdminQueueJob extends AdminJob {
  moderation_reason: string | null;
  auto_flags: Array<{ code: string; severity: 'block' | 'warn'; message: string; field: string }> | null;
  submitted_at: string | null;
  recruiter_id: number;
  recruiter_verified: boolean;
}

export interface AdminReport {
  id: number;
  target_type: 'job' | 'recruiter' | 'user';
  target_id: number;
  reason: string;
  details: string | null;
  status: 'open' | 'resolved' | 'dismissed';
  resolution_note: string | null;
  created_at: string;
  resolved_at: string | null;
  reporter_name: string | null;
  reporter_email: string | null;
}

export interface AdminAction {
  id: number;
  action: string;
  target_type: string;
  target_id: number;
  note: string | null;
  created_at: string;
  admin_name: string;
  admin_email: string;
}

export interface AdminPaginated<T> {
  users?: T[];
  jobs?: T[];
  actions?: T[];
  reports?: T[];
  total: number;
  page: number;
  limit: number;
}

// ── Analytics ─────────────────────────────────────────────────────────────────

export interface DailySignupPoint {
  date:       string;
  candidates: number;
  recruiters: number;
}

export interface DailyJobPoint {
  date:     string;
  new_jobs: number;
}

export interface DailyAppPoint {
  date:         string;
  applications: number;
}

export interface SignupAnalytics {
  range:  string;
  days:   number;
  series: DailySignupPoint[];
}

export interface JobsAnalytics {
  range:     string;
  days:      number;
  series:    DailyJobPoint[];
  by_status: Record<string, number>;
}

export interface AppAnalytics {
  range:  string;
  days:   number;
  series: DailyAppPoint[];
  funnel: Record<string, number>;
}
