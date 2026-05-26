export type ReferralStatus =
  | 'pending'
  | 'accepted'
  | 'applied'
  | 'rejected'
  | 'referred'
  | 'interview'
  | 'hired'
  | 'paid';

export interface ReferralJobOwner {
  id:         number;
  name:       string | null;
  photo:      string | null;
  role:       'candidate' | 'recruiter';
}

export interface ReferralJob {
  id:                    number;
  company_name:          string;
  job_title:             string;
  location:              string | null;
  experience_required:   string | null;
  salary_range:          string | null;
  description?:          string | null;
  skills:                string[];
  referral_reward:       string | null;
  average_response_time: string | null;
  referral_strength:     number | null;
  referral_owner_role:   'candidate' | 'recruiter';
  owner_name:            string | null;
  owner_photo:           string | null;
  request_count:         number;
  is_mine?:              boolean;
  created_at:            string;
  user_request?:         { id: number; status: ReferralStatus } | null;
}

export interface ReferralTimelineEntry {
  status: ReferralStatus;
  at:     string;
  note:   string | null;
}

export interface ReferralRequest {
  id:           number;
  status:       ReferralStatus;
  message:      string | null;
  resume_url:   string | null;
  linkedin_url: string | null;
  notes:        string | null;
  apply_link:   string | null;
  is_paid:      boolean;
  timeline:     ReferralTimelineEntry[];
  created_at:   string;
  updated_at:   string;
  referral_job: {
    id:           number;
    job_title:    string;
    company_name: string;
    location:     string | null;
    salary_range: string | null;
    skills:       string[];
  } | null;
}

export interface ReceivedReferralRequest extends ReferralRequest {
  candidate: {
    id:               number;
    name:             string;
    title:            string | null;
    photo:            string | null;
    location:         string | null;
    experience_years: number | null;
  } | null;
}

export interface ReferralJobsResponse {
  referral_jobs: ReferralJob[];
  pagination: {
    page:        number;
    limit:       number;
    total:       number;
    total_pages: number;
    has_next:    boolean;
    has_prev:    boolean;
  };
}

export interface CreateReferralJobPayload {
  company_name:          string;
  job_title:             string;
  location?:             string;
  experience_required?:  string;
  salary_range?:         string;
  description?:          string;
  skills?:               string[];
  referral_reward?:      string;
  average_response_time?: string;
  referral_strength?:    number;
}

export interface ApplyReferralPayload {
  message?:      string;
  resume_url?:   string;
  linkedin_url?: string;
}
