export interface Job {
  id: string;
  title: string;
  company: string;
  companyLogo: string;
  companyColorClass: string;
  location: string;
  workMode: 'remote' | 'hybrid' | 'onsite';
  jobType: 'full-time' | 'part-time' | 'contract' | 'internship';
  experienceMin: number;
  experienceMax: number;
  salaryMin: number;
  salaryMax: number;
  salaryLpaMin: string;
  salaryLpaMax: string;
  skills: string[];
  postedDaysAgo: number;
  companyType: 'startup' | 'mnc' | 'product' | 'service';
  isNew: boolean;
  isHot: boolean;
  applicants: number;
  isSaved?: boolean;
  hasApplied?: boolean;
}

export interface JobDetail extends Job {
  description: string;
  jobLevel: string;
  officeDetails: string;
  vacancies: number;
  closesAt: string;
  aboutCompany: string;
  responsibilities: string[];
  requirements: string[];
  niceToHave: string[];
  benefits: string[];
  companySize: string;
  companyFounded: string;
  companyIndustry: string;
  companyWebsite: string;
  recruiterName: string;
  recruiterTitle: string;
  recruiterResponseDays: number;
  isActivelyHiring: boolean;
  metrics?: {
    views: number;
    applicants: number;
    shortlisted: number;
    interviews: number;
  };
}

// ── Normalization helpers ─────────────────────────────────────────────────────
// The API returns snake_case; UI components use camelCase. These functions
// bridge the gap without touching every component.

import type { Job as ApiJob, JobDetail as ApiJobDetail } from '@/src/types/jobs';

const COLOR_CLASSES = [
  'bg-blue-500',
  'bg-purple-500',
  'bg-pink-500',
  'bg-red-500',
  'bg-orange-500',
  'bg-yellow-500',
  'bg-green-500',
  'bg-teal-500',
  'bg-cyan-500',
  'bg-indigo-500',
];

function getColorClassFallback(key: string): string {
  const hash = key.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return COLOR_CLASSES[hash % COLOR_CLASSES.length];
}

export function normalizeJob(j: ApiJob): Job {
  try {
    const daysAgo = j.posted_at
      ? Math.floor((Date.now() - new Date(j.posted_at).getTime()) / 86_400_000)
      : 0;

    return {
      id:               j.id,
      title:            j.title,
      company:          j.company,
      companyLogo:      j.company_logo ?? '',
      companyColorClass: j.company_color_class || getColorClassFallback(j.company),
      location:         j.location,
      workMode:         j.work_mode,
      jobType:          j.job_type,
      experienceMin:    j.experience_min,
      experienceMax:    j.experience_max,
      salaryMin:        j.salary_min,
      salaryMax:        j.salary_max,
      salaryLpaMin:     j.salary_lpa_min ?? String(Math.floor(j.salary_min / 100_000)),
      salaryLpaMax:     j.salary_lpa_max ?? String(Math.floor(j.salary_max / 100_000)),
      skills:           j.skills,
      postedDaysAgo:    daysAgo,
      companyType:      j.company_type,
      isNew:            j.is_new,
      isHot:            j.is_hot,
      applicants:       j.applicants,
      isSaved:          j.is_saved,
      hasApplied:       j.has_applied,
    };
  } catch (error) {
    console.error('[normalizeJob] Error normalizing job:', { job: j, error });
    throw error;
  }
}

export function normalizeJobDetail(j: ApiJobDetail): JobDetail {
  return {
    ...normalizeJob(j),
    description:          j.description ?? '',
    jobLevel:             j.job_level ?? '',
    officeDetails:        j.office_details ?? '',
    vacancies:            j.vacancies ?? 1,
    closesAt:             j.closes_at ?? '',
    aboutCompany:         j.about_company ?? '',
    responsibilities:     j.responsibilities ?? [],
    requirements:         j.requirements ?? [],
    niceToHave:           j.nice_to_have ?? [],
    benefits:             j.benefits ?? [],
    companySize:          j.company_size ?? '',
    companyFounded:       j.company_founded ?? '',
    companyIndustry:      j.company_industry ?? '',
    companyWebsite:       j.company_website ?? '',
    recruiterName:        j.recruiter_name ?? '',
    recruiterTitle:       j.recruiter_title ?? '',
    recruiterResponseDays: j.recruiter_response_days ?? 3,
    isActivelyHiring:     j.is_actively_hiring ?? true,
    metrics:              j.metrics,
  };
}

export interface FilterState {
  jobType: string[];
  workMode: string[];
  experience: string;
  companyType: string[];
  salaryMin?: number;
  salaryMax?: number;
  skills: string[];
}

export interface SearchState {
  jobTitle: string;
  company: string;
  city: string;
}
