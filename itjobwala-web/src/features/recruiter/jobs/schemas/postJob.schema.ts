// ── Constants ─────────────────────────────────────────────────────────────────

export const STEPS = ['Your Account', 'Job Basics', 'Job Details'];

export const JOB_TYPES = ['Full-time', 'Part-time', 'Contract', 'Internship', 'Freelance'];
export const WORK_MODES = ['Remote', 'On-site', 'Hybrid'];
export const JOB_LEVELS = ['Junior', 'Mid', 'Senior', 'Lead', 'Manager'];

export const PERKS = [
  { icon: '⚡', title: 'Post in 2 minutes',       sub: 'Simple job posting, no bloated forms' },
  { icon: '🎯', title: 'Reach matched candidates', sub: 'Only relevant profiles, no mass spam' },
  { icon: '💬', title: 'Direct messaging',         sub: 'Chat with candidates without a recruiter' },
  { icon: '📊', title: 'Smart analytics',          sub: 'Track views, clicks and application rates' },
  { icon: '🔒', title: 'Verified profiles only',   sub: 'All candidates are identity-verified' },
];

// ── Types ─────────────────────────────────────────────────────────────────────

export type AccountForm = {
  fullName: string;
  companyName: string;
  email: string;
  password: string;
  terms: boolean;
};
export type AccountErrors = Partial<Record<keyof AccountForm, string>>;

export type JobForm = {
  title: string;
  description: string;
  location: string;
  jobType: string;
  workMode: string;
  salaryMinLpa: number;
  salaryMaxLpa: number;
  requiredSkills: string[];
  experienceMin: number;
  experienceMax: number;
  jobLevel: string;
  vacancies: string;
  closesAt: string;
  responsibilities: string;
  requirements: string;
  niceToHave: string;
  benefits: string;
};
export type JobErrors = Partial<Record<keyof JobForm, string>>;

export const DEFAULT_JOB_FORM: JobForm = {
  title: '', description: '', location: '',
  jobType: 'Full-time', workMode: 'On-site',
  salaryMinLpa: 5, salaryMaxLpa: 20,
  requiredSkills: [],
  experienceMin: 0, experienceMax: 5,
  jobLevel: '', vacancies: '', closesAt: '',
  responsibilities: '', requirements: '',
  niceToHave: '', benefits: '',
};

// ── Helpers ───────────────────────────────────────────────────────────────────

export function parseBullets(text: string): string[] {
  return text.split('\n').map(l => l.trim()).filter(Boolean);
}

// ── Validators ────────────────────────────────────────────────────────────────

export function validateAccount(account: AccountForm): AccountErrors {
  const e: AccountErrors = {};
  if (!account.fullName.trim()) {
    e.fullName = 'Full name is required';
  } else if (!/^[a-zA-Z\s'\-]+$/.test(account.fullName.trim())) {
    e.fullName = 'Full name must contain only letters, spaces, hyphens, or apostrophes';
  } else if (account.fullName.trim().length > 100) {
    e.fullName = 'Full name must be under 100 characters';
  }
  if (!account.companyName.trim()) {
    e.companyName = 'Company name is required';
  } else if (account.companyName.trim().length < 2) {
    e.companyName = 'Company name must be at least 2 characters';
  } else if (account.companyName.trim().length > 100) {
    e.companyName = 'Company name must be under 100 characters';
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(account.email)) e.email = 'Enter a valid work email';
  if (!account.password || account.password.length < 8) e.password = 'Password must be at least 8 characters';
  if (!account.terms) e.terms = 'You must accept the Terms & Conditions';
  return e;
}

export function validateJobBasic(job: JobForm): JobErrors {
  const e: JobErrors = {};
  const title = job.title.trim();
  if (!title || title.length < 5) e.title = 'Title must be at least 5 characters';
  else if (title.length > 150) e.title = 'Title must be under 150 characters';
  else if (!/[a-zA-Z]/.test(title)) e.title = 'Title must contain at least one letter';
  if (!job.description.trim() || job.description.length < 50) e.description = 'Description must be at least 50 characters';
  const location = job.location.trim();
  if (!location) e.location = 'Location is required';
  else if (!/[a-zA-Z]/.test(location)) e.location = 'Location must contain at least one letter';
  return e;
}

export function validateJobDetail(job: JobForm): JobErrors {
  const e: JobErrors = {};
  if (job.requiredSkills.length === 0) e.requiredSkills = 'Add at least one required skill';
  if (job.vacancies) {
    const n = Number(job.vacancies);
    if (!Number.isInteger(n) || n < 1) e.vacancies = 'Vacancies must be a positive whole number (e.g. 1, 2, 5)';
  }
  if (job.closesAt && new Date(job.closesAt) <= new Date()) e.closesAt = 'Deadline must be a future date';
  if (!job.responsibilities.trim()) e.responsibilities = 'At least one responsibility is required';
  if (!job.requirements.trim()) e.requirements = 'At least one requirement is required';
  return e;
}

export function validateJobAll(job: JobForm): JobErrors {
  return { ...validateJobBasic(job), ...validateJobDetail(job) };
}
