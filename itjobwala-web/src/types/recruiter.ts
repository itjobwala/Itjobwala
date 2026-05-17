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
  status: 'active' | 'closed' | 'draft';
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
  experienceLevel: string;
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
  experienceLevel?: string;
  status?: 'active' | 'closed' | 'draft';
  responsibilities?: string[];
  requirements?: string[];
  niceToHave?: string[];
  benefits?: string[];
  vacancies?: number;
  closesAt?: string | null;
  jobLevel?: string | null;
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
  status: 'applied' | 'shortlisted' | 'interview' | 'rejected' | 'hired' | 'selected' | 'withdrawn' | 'offer';
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
}

export interface UpdateApplicantStatusRequest {
  status: 'applied' | 'shortlisted' | 'interview' | 'rejected' | 'hired' | 'selected' | 'withdrawn' | 'offer';
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
