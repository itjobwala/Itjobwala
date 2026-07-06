import type { CompanyInfo, CompanyDetail } from './company.types';
import type { RecruiterInfo } from './recruiterJob.types';
import type { Job as ApiJob, JobDetail as ApiJobDetail } from '@/features/jobs/shared/types/apiJobs.types';
import { hashColor } from '@/src/lib/utils/format';

export interface Job extends CompanyInfo {
  id: string;
  numericId?: number;
  title: string;
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
  isNew: boolean;
  isHot: boolean;
  applicants: number;
  isSaved?: boolean;
  hasApplied?: boolean;
  companyVerified?: boolean;
  closesAt?: string | null;
  jobFitScore?: number | null;
}

export interface JobDetail extends Job, CompanyDetail, RecruiterInfo {
  description: string;
  jobLevel: string;
  officeDetails: string;
  vacancies: number;
  closesAt: string;
  responsibilities: string[];
  requirements: string[];
  niceToHave: string[];
  benefits: string[];
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

// ── Normalization helpers ─────────────────────────────────────────────────────

export function normalizeJob(j: ApiJob): Job {
  try {
    const daysAgo = j.posted_at
      ? Math.floor((Date.now() - new Date(j.posted_at).getTime()) / 86_400_000)
      : 0;

    return {
      id:                j.id,
      numericId:         j.numeric_id,
      title:             j.title,
      company:           j.company,
      companyLogo:       j.company_logo ?? '',
      companyColorClass: j.company_color_class || hashColor(j.company),
      companyType:       j.company_type,
      location:          j.location,
      workMode:          j.work_mode,
      jobType:           j.job_type,
      experienceMin:     j.experience_min,
      experienceMax:     j.experience_max,
      salaryMin:         j.salary_min,
      salaryMax:         j.salary_max,
      salaryLpaMin:      j.salary_lpa_min ?? String(Math.floor(j.salary_min / 100_000)),
      salaryLpaMax:      j.salary_lpa_max ?? String(Math.floor(j.salary_max / 100_000)),
      skills:            j.skills,
      postedDaysAgo:     daysAgo,
      isNew:             j.is_new,
      isHot:             j.is_hot,
      applicants:        j.applicants,
      isSaved:           j.is_saved,
      hasApplied:        j.has_applied,
      companyVerified:   j.company_verified ?? false,
      closesAt:          j.closes_at ?? null,
      jobFitScore:       j.job_fit_score ?? null,
    };
  } catch (error) {
    console.error('[normalizeJob] Error normalizing job:', { job: j, error });
    throw error;
  }
}

export function normalizeJobDetail(j: ApiJobDetail): JobDetail {
  return {
    ...normalizeJob(j),
    description:           j.description ?? '',
    jobLevel:              j.job_level ?? '',
    officeDetails:         j.office_details ?? '',
    vacancies:             j.vacancies ?? 1,
    closesAt:              j.closes_at ?? '',
    aboutCompany:          j.about_company ?? '',
    responsibilities:      j.responsibilities ?? [],
    requirements:          j.requirements ?? [],
    niceToHave:            j.nice_to_have ?? [],
    benefits:              j.benefits ?? [],
    companySize:           j.company_size ?? '',
    companyFounded:        j.company_founded ?? '',
    companyIndustry:       j.company_industry ?? '',
    companyWebsite:        j.company_website ?? '',
    recruiterName:         j.recruiter_name ?? '',
    recruiterTitle:        j.recruiter_title ?? '',
    recruiterResponseDays: j.recruiter_response_days ?? 3,
    isActivelyHiring:      j.is_actively_hiring ?? true,
    metrics:               j.metrics,
  };
}
