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

export interface ApplicantSkillEvidence {
  skill:          string;
  evidence_level: string;
  evidence_score: number;
  proof_sources:  string[];
}

export interface ApplicantRiskFlag {
  flag:             string;
  severity:         string;
  impact_score:     number;
  explanation:      string;
  recruiter_effect: string;
}

export interface ScoreDistribution {
  high_count:     number;
  mid_count:      number;
  low_count:      number;
  unscored_count: number;
  total:          number;
}

export interface TopCandidate {
  id:           string;
  candidateName: string;
  jobTitle:     string;
  jobId:        string;
  qaMatchScore: number;
  careerLevel:  string | null;
  status:       string;
  appliedDate:  string;
  topSkills:    string[];
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
  qaMatchScore?: number | null;
  skillEvidence?: ApplicantSkillEvidence[] | null;
  riskFlags?: ApplicantRiskFlag[] | null;
  weakEvidenceSkills?: string[] | null;
  missingSkills?: string[] | null;
  careerLevel?: string | null;
  certCount?: number;
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

export interface BulkRejectSkip {
  id: string;
  reason: string;
}

export interface BulkRejectResponse {
  rejected: string[];
  skipped: BulkRejectSkip[];
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

export interface SkillEvidenceEntry {
  skill:          string;
  evidence_level: string;
  evidence_score: number;
  proof_sources:  string[];
}

export interface RiskFlag {
  flag:             string;
  severity:         string;
  explanation:      string;
  impact_score:     number;
  recruiter_effect: string;
}

export interface SkillMetaEntry {
  skill:          string;
  evidence_level: string;
  evidence_score: number;
  years_used?:    number | null;
  last_used?:     string | null;
}

export interface ATSPrioritySkill {
  skill:            string;
  score:            number;
  dimension:        string;
  reason:           string;
  recruiter_impact?: string;
}

export interface ApplicantATSIntelligence {
  has_data:              boolean;
  eligible?:             boolean;
  detected_domain?:      string | null;
  domain_label?:         string | null;

  qa_match_score?:       number | null;
  capability_score?:     number | null;
  band_label?:           string;
  band_color?:           string;
  career_level?:         string | null;
  experience_years?:     number | null;
  certifications?:       Array<{ name: string; issuer?: string }>;
  certification_count?:  number;

  qa_specialization?:    string | null;
  qa_seniority?:         string | null;
  qa_hiring_label?:      string | null;
  recruiter_confidence?: string | null;
  qa_score_breakdown?:   Record<string, { score: number; max: number }> | null;

  extracted_skills?:     string[];
  missing_skills?:       string[];
  skill_metadata?:       SkillMetaEntry[];
  skill_evidence?:       SkillEvidenceEntry[];
  weak_evidence_skills?: string[];

  risk_flags?:           RiskFlag[];
  overall_risk_level?:   string;
  overall_risk_score?:   number;

  improvement_priorities?: {
    high_priority?:   ATSPrioritySkill[];
    medium_priority?: ATSPrioritySkill[];
    low_priority?:    ATSPrioritySkill[];
  } | null;

  evidence_density?:       number | null;
  recruiter_trust_score?:  number | null;
  has_quantified_impact?:  boolean;
  has_architecture_depth?: boolean;

  trust_signals?:          Array<{ signal: string; note: string; impact: string }>;
  fastest_trust_gain?:     string | null;

  shortlist_probability?:  number | null;
  automation_maturity?:    string | null;
  enterprise_readiness?:   string | null;
  market_readiness?:       string | null;
  recruiter_visibility?:   string | null;
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
    score_distribution?: ScoreDistribution;
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
