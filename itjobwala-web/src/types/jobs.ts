import type { Pagination } from './api';

export type WorkMode    = 'remote' | 'hybrid' | 'onsite';
export type JobType     = 'full-time' | 'part-time' | 'contract' | 'internship';
export type CompanyType = 'startup' | 'mnc' | 'product' | 'service';
export type JobStatus   = 'active' | 'closed' | 'draft' | 'paused';

export interface Job {
  id:                  string;
  title:               string;
  company:             string;
  company_logo:        string;
  company_color_class: string | null;
  location:            string;
  work_mode:           WorkMode;
  job_type:            JobType;
  experience_min:      number;
  experience_max:      number;
  salary_min:          number;
  salary_max:          number;
  salary_lpa_min?:     string;
  salary_lpa_max?:     string;
  skills:              string[];
  company_type:        CompanyType;
  is_new:              boolean;
  is_hot:              boolean;
  applicants:          number;
  posted_at:           string;
  is_saved?:           boolean;
  has_applied?:        boolean;
}

export interface JobDetail extends Job {
  description:           string;
  salary_currency:       string;
  salary_period:         string;
  job_level:             string;
  office_details:        string;
  vacancies:             number;
  closes_at:             string;
  about_company:         string;
  responsibilities:      string[];
  requirements:          string[];
  nice_to_have:          string[];
  benefits:              string[];
  company_size:          string;
  company_founded:       string;
  company_industry:      string;
  company_website:       string;
  recruiter_name:        string;
  recruiter_title:       string;
  recruiter_response_days: number;
  is_actively_hiring:    boolean;
  metrics?: {
    views:               number;
    applicants:          number;
    shortlisted:         number;
    interviews:          number;
  };
}

export interface JobsListResponse {
  jobs:       Job[];
  pagination: Pagination;
}

export interface JobFilters {
  page?:         number;
  limit?:        number;
  q?:            string;
  company?:      string;
  location?:     string;
  job_type?:     string;
  work_mode?:    string;
  experience?:   string;
  company_type?: string;
  salary_min?:   number;
  salary_max?:   number;
  skills?:       string;
  sort?:         string;
}

// Recruiter-side posted job shape
export interface RecruiterJob {
  id:                   string;
  title:                string;
  location:             string;
  work_mode:            WorkMode;
  job_type:             JobType;
  status:               JobStatus;
  applicants_count:     number;
  new_applicants_count: number;
  shortlisted_count:    number;
  views:                number;
  posted_at:            string;
  closes_at?:           string;
}

export interface CreateJobRequest {
  title:               string;
  department?:         string;
  location:            string;
  work_mode:           WorkMode;
  job_type:            JobType;
  experience_min:      number;
  experience_max:      number;
  salary_min?:         number;
  salary_max?:         number;
  salary_currency?:    string;
  is_salary_disclosed?: boolean;
  skills:              string[];
  about_role:          string;
  responsibilities:    string[];
  requirements:        string[];
  nice_to_have?:       string[];
  benefits?:           string[];
  vacancies?:          number;
  closes_at?:          string;
  status:              'active' | 'draft';
}

export interface JobCategory {
  key: string;
  label: string;
  filter_key: string;
  category_type: string;
  count: number;
}

export interface JobCategoriesResponse {
  categories: JobCategory[];
}