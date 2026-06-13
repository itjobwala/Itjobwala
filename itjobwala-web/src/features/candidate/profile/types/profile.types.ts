export interface WorkExperience {
  id:              string | number;
  user_id?:        number;
  company:         string;
  company_logo?:   string;
  role:            string;
  title?:          string; // alias some backends use
  employment_type: string;
  location?:       string;
  start_date:      string;
  end_date?:       string | null;
  is_current:      boolean;
  current?:        boolean; // alias
  description?:    string;
  skills?:         string[];
  created_at?:     string;
  updated_at?:     string;
}

export interface Education {
  id:             string | number;
  user_id?:       number;
  institution:    string;
  degree:         string;
  field_of_study?: string;
  field?:         string;
  location?:      string;
  start_date?:    string;
  end_date?:      string;
  start_year?:    number;
  end_year?:      number;
  grade?:         string;
  is_current?:    boolean;
  created_at?:    string;
  updated_at?:    string;
}

export interface Certificate {
  file_name: string;
  file_url: string;
  uploaded_at: string;
}

export interface Certification {
  id:           string | number;
  user_id?:     number;
  name:         string;
  issuer:       string;
  issue_date:   string;
  certificate?: Certificate;
  created_at?:  string;
  updated_at?:  string;
}

export interface Resume {
  file_name:   string;
  url:         string;
  uploaded_at: string;
}

export interface CareerProfile {
  current_industry?: string;
  department?: string;
  role_category?: string;
  job_role?: string;
  desired_job_type?: string;
  desired_employment_type?: string;
  preferred_shift?: string;
  preferred_work_location?: string | string[];
}

export interface Language {
  id:          string;
  name:        string;
  proficiency: string;
  read:        boolean;
  write:       boolean;
  speak:       boolean;
}

export interface PersonalDetails {
  gender?:         string;
  marital_status?: string;
  date_of_birth?:  string;
  category?:       string;
  authorized_to_work_in_us?:    boolean;
  work_permit_other_countries?: boolean;
  address?:        string;
  languages?:      Language[];
}

export interface RecruiterVisibility {
  recruiter_visible: boolean;
  open_to_job_types: string[];
  profile_views?: number | null;
  recruiter_messages?: number | null;
  last_active?: string;
}

export interface CandidateProfile {
  id:                 string;
  name?:              string;
  first_name?:        string;
  last_name?:         string;
  email:              string;
  phone?:             string;
  location?:          string;
  linked_in?:         string;
  github?:            string;
  about?:             string;
  title?:             string;
  bio?:               string;
  open_to_work?:      boolean;
  profile_completion?: number;
  work_status?:       string;
  availability_to_join?: string;
  experience_years?:  number;
  expected_salary?:   number | string;
  current_salary?:    number | string;
  profile_photo_url?: string;
  profile_cover_url?: string;
  skills:             string[];
  experience:         WorkExperience[];
  education:          Education[];
  certifications:     Certification[];
  career_profile?:    CareerProfile;
  personal_details?:  PersonalDetails;
  recruiter_visibility?: RecruiterVisibility;
  resume?:            Resume;
  created_at?:        string;
  updated_at?:        string;
}

export interface UpdateProfileRequest {
  first_name?:      string;
  last_name?:       string;
  email?:           string;
  title?:           string;
  phone?:           string;
  location?:        string;
  experience_years?: number;
  current_salary?:  string | number;
  expected_salary?: string | number;
  work_status?:     string;
  availability_to_join?: string;
  open_to_work?:    boolean;
  github?:          string;
  linked_in?:       string;
  about?:           string;
  bio?:             string;
  skills?:          string[];
  career_profile?:  CareerProfile;
  personal_details?: PersonalDetails;
}

export interface UpdateSkillsRequest {
  skills: string[];
}

export interface AddExperienceRequest {
  company:          string;
  role:             string;
  employment_type:  string;
  start_date:       string;
  end_date?:        string | null;
  is_current:       boolean;
  location?:        string;
  description?:     string;
}

export interface AddEducationRequest {
  institution:    string;
  degree:         string;
  field_of_study: string;
  location?:      string;
  start_date:     string;
  end_date?:      string | null;
  grade?:         string;
  is_current?:    boolean;
}

export interface AddCertificationRequest {
  name:      string;
  issuer:    string;
  issue_date: string;
  certificate?: {
    file_name: string;
    file_url: string;
  };
}

export interface UpdateRecruiterVisibilityRequest {
  recruiter_visible: boolean;
  open_to_job_types: string[];
}

export interface RecruiterVisibilityResponse {
  recruiter_visible: boolean;
  open_to_job_types: string[];
  profile_views: number | null;
  recruiter_messages: number | null;
  last_active: string;
}

export interface ProfileCompletionBreakdown {
  resume: boolean;
  experience: boolean;
  skills: boolean;
  photo: boolean;
  education: boolean;
  linked_in: boolean;
}

export interface ProfileCompletionData {
  percentage: number;
  completed_count: number;
  total_count: number;
  breakdown: ProfileCompletionBreakdown;
}
