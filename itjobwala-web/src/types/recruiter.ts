// Recruiter Company Profile
export interface RecruiterCompanyProfile {
  id: string;
  companyName: string;
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
  applicationCount: number;
  postedDate: string;
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
  status: 'new' | 'reviewing' | 'shortlisted' | 'rejected' | 'hired';
  profilePhoto?: string;
  resume?: string;
  skills?: string[];
  experience?: number;
  profile?: {
    title?: string;
    location?: string;
    about?: string;
  };
}

export interface UpdateApplicantStatusRequest {
  status: 'new' | 'reviewing' | 'shortlisted' | 'rejected' | 'hired';
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
