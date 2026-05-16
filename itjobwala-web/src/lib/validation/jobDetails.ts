import type { JobDetail } from '@/src/types/jobs';

export interface ValidationError {
  field: string;
  message: string;
}

export class JobDetailValidator {
  static validateJobDetail(job: unknown): ValidationError[] {
    const errors: ValidationError[] = [];

    if (!job || typeof job !== 'object') {
      return [{ field: 'job', message: 'Invalid job object' }];
    }

    const j = job as Record<string, unknown>;

    // Required string fields
    this.validateString(j, 'title', { min: 5, max: 200 }, errors);
    this.validateString(j, 'company', { min: 1, max: 100 }, errors);
    this.validateString(j, 'location', { min: 1, max: 100 }, errors);
    this.validateString(j, 'recruiter_name', { min: 1, max: 100 }, errors);
    this.validateString(j, 'recruiter_title', { min: 1, max: 100 }, errors);

    // Required number fields
    this.validateNumber(j, 'experience_min', { min: 0, max: 70 }, errors);
    this.validateNumber(j, 'experience_max', { min: 0, max: 70 }, errors);
    this.validateNumber(j, 'salary_min', { min: 0, max: 1_000_000 }, errors);
    this.validateNumber(j, 'salary_max', { min: 0, max: 1_000_000 }, errors);

    // Cross-field validation
    if (typeof j.experience_min === 'number' && typeof j.experience_max === 'number') {
      if (j.experience_min > j.experience_max) {
        errors.push({ field: 'experience', message: 'experience_max must be greater than experience_min' });
      }
    }

    if (typeof j.salary_min === 'number' && typeof j.salary_max === 'number') {
      if (j.salary_min > j.salary_max) {
        errors.push({ field: 'salary', message: 'salary_max must be greater than salary_min' });
      }
    }

    // Enum validation
    this.validateEnum(j, 'job_type', ['full-time', 'part-time', 'contract', 'internship'], errors);
    this.validateEnum(j, 'work_mode', ['remote', 'hybrid', 'onsite'], errors);
    this.validateEnum(j, 'company_type', ['startup', 'mnc', 'product', 'service'], errors);

    // Array validation
    this.validateArray(j, 'skills', { min: 1, max: 15, itemMaxLen: 50 }, errors);
    this.validateArray(j, 'responsibilities', { min: 1, max: 10, itemMinLen: 20, itemMaxLen: 500 }, errors);
    this.validateArray(j, 'requirements', { min: 1, max: 10, itemMinLen: 20, itemMaxLen: 500 }, errors);
    this.validateArray(j, 'benefits', { min: 0, max: 10 }, errors);
    this.validateArray(j, 'nice_to_have', { min: 0, max: 10 }, errors);

    // Optional fields
    if (j.about_company && typeof j.about_company === 'string') {
      if (j.about_company.trim().length < 10) {
        errors.push({ field: 'about_company', message: 'Must be at least 10 characters' });
      }
    }

    if (j.company_website && typeof j.company_website === 'string') {
      if (!this.isValidUrl(j.company_website)) {
        errors.push({ field: 'company_website', message: 'Must be a valid URL' });
      }
    }

    if (typeof j.recruiter_response_days === 'number') {
      if (j.recruiter_response_days < 1 || j.recruiter_response_days > 30) {
        errors.push({ field: 'recruiter_response_days', message: 'Must be between 1 and 30 days' });
      }
    }

    if (typeof j.posted_at === 'string') {
      const date = new Date(j.posted_at);
      if (isNaN(date.getTime())) {
        errors.push({ field: 'posted_at', message: 'Invalid date format' });
      } else if (date > new Date()) {
        errors.push({ field: 'posted_at', message: 'Cannot be a future date' });
      }
    }

    return errors;
  }

  private static validateString(
    obj: Record<string, unknown>,
    field: string,
    opts: { min?: number; max?: number },
    errors: ValidationError[]
  ) {
    const value = obj[field];
    if (value === null || value === undefined) {
      errors.push({ field, message: 'Required field' });
      return;
    }
    if (typeof value !== 'string') {
      errors.push({ field, message: 'Must be a string' });
      return;
    }
    const len = value.trim().length;
    if (opts.min && len < opts.min) {
      errors.push({ field, message: `Minimum ${opts.min} characters` });
    }
    if (opts.max && len > opts.max) {
      errors.push({ field, message: `Maximum ${opts.max} characters` });
    }
  }

  private static validateNumber(
    obj: Record<string, unknown>,
    field: string,
    opts: { min?: number; max?: number },
    errors: ValidationError[]
  ) {
    const value = obj[field];
    if (value === null || value === undefined) {
      errors.push({ field, message: 'Required field' });
      return;
    }
    if (typeof value !== 'number') {
      errors.push({ field, message: 'Must be a number' });
      return;
    }
    if (opts.min !== undefined && value < opts.min) {
      errors.push({ field, message: `Minimum value is ${opts.min}` });
    }
    if (opts.max !== undefined && value > opts.max) {
      errors.push({ field, message: `Maximum value is ${opts.max}` });
    }
  }

  private static validateEnum(
    obj: Record<string, unknown>,
    field: string,
    allowedValues: string[],
    errors: ValidationError[]
  ) {
    const value = obj[field];
    if (value === null || value === undefined) {
      errors.push({ field, message: 'Required field' });
      return;
    }
    if (typeof value !== 'string' || !allowedValues.includes(value)) {
      errors.push({ field, message: `Must be one of: ${allowedValues.join(', ')}` });
    }
  }

  private static validateArray(
    obj: Record<string, unknown>,
    field: string,
    opts: { min?: number; max?: number; itemMinLen?: number; itemMaxLen?: number },
    errors: ValidationError[]
  ) {
    const value = obj[field];
    if (value === null || value === undefined) {
      if (opts.min && opts.min > 0) {
        errors.push({ field, message: 'Required field' });
      }
      return;
    }
    if (!Array.isArray(value)) {
      errors.push({ field, message: 'Must be an array' });
      return;
    }
    if (opts.min && value.length < opts.min) {
      errors.push({ field, message: `Minimum ${opts.min} items` });
    }
    if (opts.max && value.length > opts.max) {
      errors.push({ field, message: `Maximum ${opts.max} items` });
    }
    value.forEach((item, idx) => {
      if (typeof item !== 'string') {
        errors.push({ field: `${field}[${idx}]`, message: 'Item must be a string' });
        return;
      }
      const len = item.trim().length;
      if (opts.itemMinLen && len < opts.itemMinLen) {
        errors.push({ field: `${field}[${idx}]`, message: `Minimum ${opts.itemMinLen} characters` });
      }
      if (opts.itemMaxLen && len > opts.itemMaxLen) {
        errors.push({ field: `${field}[${idx}]`, message: `Maximum ${opts.itemMaxLen} characters` });
      }
    });
  }

  private static isValidUrl(url: string): boolean {
    try {
      const u = new URL(url);
      return u.protocol === 'http:' || u.protocol === 'https:';
    } catch {
      return false;
    }
  }

  static calculateDaysPosted(postedAt: string): number {
    const date = new Date(postedAt);
    if (isNaN(date.getTime())) return 0;
    return Math.floor((Date.now() - date.getTime()) / 86_400_000);
  }

  static formatDaysPosted(postedAt: string): string {
    const days = this.calculateDaysPosted(postedAt);
    if (days === 0) return 'Today';
    if (days === 1) return '1d ago';
    if (days < 7) return `${days}d ago`;
    if (days < 14) return '1 week ago';
    return `${Math.floor(days / 7)} weeks ago`;
  }

  static formatSalary(min: number, max: number): string {
    if (min === 0 && max === 0) return 'Salary on discussion';
    if (min === max) return `₹${min} LPA`;
    return `₹${min}–${max} LPA`;
  }

  static formatExperience(min: number, max: number): string {
    if (min === max) return `${min} year${min === 1 ? '' : 's'}`;
    return `${min}–${max} years`;
  }

  static formatRecruiterResponseDays(days: number): string {
    if (days === 1) return 'Responds within 1 day';
    if (days <= 3) return `Usually responds in ${days} days`;
    if (days <= 7) return `May take up to ${days} days`;
    return 'May take a week or more';
  }
}
