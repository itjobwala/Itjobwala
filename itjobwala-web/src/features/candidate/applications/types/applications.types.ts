import type { Pagination } from '@/src/types/api';

export type ApplicationStatus =
  | 'applied'
  | 'shortlisted'
  | 'interview'
  | 'hired'
  | 'rejected'
  | 'withdrawn';

export interface Application {
  id:                  string;
  job_id:              string;
  title:               string;
  company:             string;
  company_logo?:       string;
  company_color_class?: string;
  company_verified?:   boolean;
  location?:           string;
  status:              ApplicationStatus;
  applied_at:          string;
  updated_at?:         string;
}

export interface ApplicationTimeline {
  status: ApplicationStatus;
  at:     string;
  note?:  string | null;
}

export interface ApplicationDetailJob {
  id:      string;
  title:   string;
  company: string;
}

export interface CandidateInterview {
  type:             'video' | 'phone' | 'in_person';
  scheduled_at:     string;
  duration_minutes?: number | null;
  meeting_link?:    string | null;
  location?:        string | null;
  note?:            string | null;
  status:           'scheduled' | 'past' | 'not_scheduled';
}

/** Shape returned by GET /candidate/applications/:id */
export interface ApplicationDetail {
  id:            string;
  job:           ApplicationDetailJob;
  status:        ApplicationStatus;
  timeline:      ApplicationTimeline[];
  applied_at:    string;
  feedback_note?: string | null;
  interview?:    CandidateInterview | null;
}

export interface ApplicationsListResponse {
  applications: Application[];
  pagination:   Pagination;
}

export interface ApplyJobRequest {
  cover_letter?:      string;
  expected_salary?:   number;
  notice_period_days?: number;
}

export interface SavedJob {
  id:                  string;
  job_id:              string;
  title:               string;
  company:             string;
  company_logo?:       string;
  company_color_class?: string;
  company_verified?:   boolean;
  location?:           string;
  salary_min?:         number;
  salary_max?:         number;
  work_mode?:          string;
  job_type?:           string;
  is_active?:          boolean;
  saved_at:            string;
}

export interface SavedJobsListResponse {
  saved_jobs: SavedJob[];
  pagination: Pagination;
}

// Recruiter-side applicant
export interface Applicant {
  application_id:         string;
  candidate_id:           string;
  candidate_name:         string;
  candidate_initials?:    string;
  avatar_color_class?:    string;
  candidate_avatar_color_class?: string;
  current_role?:          string;
  experience_years?:      number;
  location?:              string;
  skills?:                string[];
  match_score?:           number;
  status:                 ApplicationStatus;
  resume_url?:            string;
  applied_at:             string;
  job_id?:                string;
  job_title?:             string;
}

export interface ApplicantsListResponse {
  applicants: Applicant[];
  pagination: Pagination;
}

export interface UpdateApplicationStatusRequest {
  status: Exclude<ApplicationStatus, 'applied' | 'withdrawn'>;
  note?:  string;
}

export interface ScheduleInterviewRequest {
  scheduled_time:  string;
  interview_type:  'video' | 'phone' | 'in-person';
  link?:           string;
  location?:       string;
  message?:        string;
  duration_minutes?: number;
}
