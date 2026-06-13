// Recruiter Company Profile
export interface RecruiterCompanyProfile {
  id: string;
  companyName: string;
  fullName?: string;
  industry: string;
  website?: string;
  description?: string;
  logo?: string;
  companySize?: string;
  location?: string;
  foundedYear?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface UpdateCompanyProfileRequest {
  companyName?: string;
  industry?: string;
  website?: string;
  description?: string;
  companySize?: string;
  location?: string;
  foundedYear?: number;
}

// Recruiter Posted Job
export interface RecruiterPostedJob {
  id: string;
  title: string;
  description: string;
  location: string;
  jobType: string;
  workMode: string;
  salaryMin?: number;
  salaryMax?: number;
  requiredSkills: string[];
  experienceLevel: string;
  responsibilities?: string[];
  requirements?: string[];
  niceToHave?: string[];
  benefits?: string[];
  vacancies?: number;
  closesAt?: string | null;
  jobLevel?: string | null;
  applicationCount: number;
  postedDate: string | null;
  status: 'active' | 'closed' | 'draft' | 'pending' | 'needs_changes' | 'removed';
  moderationReason: string | null;
  autoFlags: Array<{ code: string; severity: 'block' | 'warn'; message: string; field: string }>;
  submittedAt: string | null;
  companyId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateJobPostRequest {
  title: string;
  description: string;
  location: string;
  jobType: string;
  workMode: string;
  salaryMin?: number;
  salaryMax?: number;
  requiredSkills: string[];
  experienceMin: number;
  experienceMax: number;
  responsibilities?: string[];
  requirements?: string[];
  niceToHave?: string[];
  benefits?: string[];
  vacancies?: number;
  closesAt?: string;
  jobLevel?: string;
}

export interface UpdateJobPostRequest {
  title?: string;
  description?: string;
  location?: string;
  jobType?: string;
  workMode?: string;
  salaryMin?: number;
  salaryMax?: number;
  requiredSkills?: string[];
  experienceMin?: number;
  experienceMax?: number;
  status?: 'closed' | 'draft';
  responsibilities?: string[];
  requirements?: string[];
  niceToHave?: string[];
  benefits?: string[];
  vacancies?: number;
  closesAt?: string | null;
  jobLevel?: string | null;
}

export interface RecruiterApplicantInterview {
  id: string;
  type: 'video' | 'phone' | 'in_person' | null;
  scheduled_at: string | null;
  duration_minutes: number | null;
  meeting_link: string | null;
  location: string | null;
  notes: string | null;
  status: 'scheduled' | 'past' | 'not_scheduled';
}

// Recruiter Applicant
export interface RecruiterApplicant {
  id: string;
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  jobTitle: string;
  jobId: string;
  appliedDate: string;
  status: 'applied' | 'shortlisted' | 'interview' | 'rejected' | 'hired' | 'withdrawn';
  profilePhoto?: string;
  resume?: string;
  skills?: string[];
  experience?: number;
  profile?: {
    title?: string;
    location?: string;
    about?: string;
    phone?: string | null;
    linkedin?: string | null;
    github?: string | null;
  };
  coverLetter?: string;
  interview?: RecruiterApplicantInterview | null;
}

export interface UpdateApplicantStatusRequest {
  status: 'applied' | 'shortlisted' | 'interview' | 'rejected' | 'hired' | 'withdrawn';
}

// Recruiter Interview
export interface RecruiterInterview {
  id: string;
  applicationId: string;
  candidateName: string;
  candidateEmail: string;
  candidatePhoto?: string | null;
  jobTitle: string;
  jobId: string;
  scheduledAt: string | null;
  durationMinutes: number | null;
  interviewType: 'video' | 'phone' | 'in_person' | null;
  meetingLink: string | null;
  location: string | null;
  notes: string | null;
  status: 'scheduled' | 'past' | 'not_scheduled';
}

export interface ScheduleInterviewRequest {
  applicationId: string;
  interviewType: 'video' | 'phone' | 'in_person';
  scheduledAt: string;
  durationMinutes?: number;
  meetingLink?: string;
  location?: string;
  note?: string;
}

export interface RecruiterInterviewsResponse {
  success: boolean;
  message: string;
  data: { interviews: RecruiterInterview[] };
}

// Phase 8: ATS Intelligence Types

export interface ApplicantATSIntelligence {
  has_data: boolean;
  qa_match_score: number | null;
  qa_specialization: string | null;
  qa_seniority: string | null;
  qa_hiring_label: string | null;
  recruiter_confidence: string | null;
  specialization_confidence: number | null;
  shortlist_probability: number | null;
  recruiter_visibility: string | null;
  market_readiness: string | null;
  best_fit_roles: string[];
  recruiter_tip: string | null;
  concerns: string[];
  extracted_skills: string[];
  missing_skills: string[];
  strengths: string[];
  weaknesses: string[];
}

export interface PoolScoreBucket {
  label: string;
  min: number;
  max: number;
  count: number;
}

export interface PoolTopCandidate {
  applicant_id: string;
  qa_match_score: number | null;
  qa_specialization: string | null;
  qa_seniority: string | null;
  qa_hiring_label: string | null;
  recruiter_confidence: string | null;
  status: string;
}

export interface PoolIntelligence {
  total_applicants: number;
  applicants_with_data: number;
  avg_score: number | null;
  score_distribution: PoolScoreBucket[];
  specialization_breakdown: Record<string, number>;
  top_candidates: PoolTopCandidate[];
}

// API Response Types
export interface RecruiterJobsResponse {
  success: boolean;
  message: string;
  data: {
    jobs: RecruiterPostedJob[];
    pagination?: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}

export interface RecruiterApplicantsResponse {
  success: boolean;
  message: string;
  data: {
    applicants: RecruiterApplicant[];
    pagination?: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}

export interface RecruiterCompanyProfileResponse {
  success: boolean;
  message: string;
  data: RecruiterCompanyProfile;
}

export interface RecruiterJobDetailResponse {
  success: boolean;
  message: string;
  data: RecruiterPostedJob;
}
