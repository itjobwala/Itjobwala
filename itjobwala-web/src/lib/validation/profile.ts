export interface ValidationError {
  field: string;
  message: string;
}

export class ProfileValidator {
  static validateEmail(email: string): ValidationError | null {
    if (!email?.trim()) return { field: 'email', message: 'Email is required' };
    if (!email.includes('@') || !email.includes('.')) return { field: 'email', message: 'Please enter a valid email' };
    return null;
  }

  static validatePhone(phone: string): ValidationError | null {
    if (!phone?.trim()) return null;
    if (!/^[\d+\-\s()]{10,}$/.test(phone)) return { field: 'phone', message: 'Please enter a valid phone number' };
    return null;
  }

  static validateUrl(url: string): ValidationError | null {
    if (!url?.trim()) return null;
    try {
      new URL(url);
      return null;
    } catch {
      return { field: 'url', message: 'Please enter a valid URL' };
    }
  }

  static validateRequired(value: string | undefined, field: string): ValidationError | null {
    if (!value?.trim()) return { field, message: `${field} is required` };
    return null;
  }

  static validateMinLength(value: string, min: number, field: string): ValidationError | null {
    if (!value?.trim()) return null;
    if (value.length < min) return { field, message: `${field} must be at least ${min} characters` };
    return null;
  }

  static validateMaxLength(value: string, max: number, field: string): ValidationError | null {
    if (!value?.trim()) return null;
    if (value.length > max) return { field, message: `${field} must not exceed ${max} characters` };
    return null;
  }

  static validateDateFormat(date: string, field: string): ValidationError | null {
    if (!date) return null;
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return { field, message: `${field} must be in YYYY-MM-DD format` };
    }
    return null;
  }

  static validateDateRange(startDate: string, endDate: string | null, isCurrent: boolean): ValidationError | null {
    if (!startDate) return { field: 'start_date', message: 'Start date is required' };

    const startFormatError = this.validateDateFormat(startDate, 'start_date');
    if (startFormatError) return startFormatError;

    if (!isCurrent && !endDate) return { field: 'end_date', message: 'End date is required' };

    if (endDate) {
      const endFormatError = this.validateDateFormat(endDate, 'end_date');
      if (endFormatError) return endFormatError;

      if (new Date(startDate) > new Date(endDate)) {
        return { field: 'end_date', message: 'End date must be after start date' };
      }
    }
    return null;
  }

  static validateSkills(skills: string[]): ValidationError | null {
    if (!skills || skills.length === 0) return { field: 'skills', message: 'Please add at least one skill' };
    return null;
  }

  static validatePersonalInfo(data: any): ValidationError | null {
    const firstNameError = this.validateRequired(data.firstName, 'First name');
    if (firstNameError) return firstNameError;

    const lastNameError = this.validateRequired(data.lastName, 'Last name');
    if (lastNameError) return lastNameError;

    return this.validateEmail(data.email);
  }

  static validateAbout(about: string): ValidationError | null {
    return this.validateMaxLength(about, 700, 'About section');
  }

  static validateExperience(exp: any): ValidationError | null {
    if (!exp?.company?.trim()) return { field: 'company', message: 'Company name is required' };
    if (!exp?.role?.trim()) return { field: 'role', message: 'Role is required' };
    if (!exp?.employment_type?.trim()) return { field: 'employment_type', message: 'Employment type is required' };

    const dateRangeError = this.validateDateRange(exp?.start_date, exp?.end_date, exp?.is_current);
    if (dateRangeError) return dateRangeError;

    return null;
  }

  static validateEducation(edu: any): ValidationError | null {
    if (!edu?.institution?.trim()) return { field: 'institution', message: 'Institution is required' };
    if (!edu?.degree?.trim()) return { field: 'degree', message: 'Degree is required' };
    if (!edu?.field_of_study?.trim()) return { field: 'field_of_study', message: 'Field of study is required' };

    const dateRangeError = this.validateDateRange(edu?.start_date, edu?.end_date, edu?.is_current);
    if (dateRangeError) return dateRangeError;

    return null;
  }

  static validateCertification(cert: any): ValidationError | null {
    if (!cert?.name?.trim()) return { field: 'name', message: 'Certification name is required' };
    if (!cert?.issuer?.trim()) return { field: 'issuer', message: 'Issuing organization is required' };
    if (!cert?.issue_date) return { field: 'issue_date', message: 'Issue date is required' };

    const issueDateFormatError = this.validateDateFormat(cert?.issue_date, 'issue_date');
    if (issueDateFormatError) return issueDateFormatError;

    if (cert?.expiry_date) {
      const expiryDateFormatError = this.validateDateFormat(cert?.expiry_date, 'expiry_date');
      if (expiryDateFormatError) return expiryDateFormatError;

      if (new Date(cert.issue_date) > new Date(cert.expiry_date)) {
        return { field: 'expiry_date', message: 'Expiry date must be after issue date' };
      }
    }
    return null;
  }

  static validateCareerProfile(career: any): ValidationError | null {
    // Required fields
    if (!career?.current_industry?.trim()) return { field: 'current_industry', message: 'Current industry is required' };
    if (!career?.department?.trim()) return { field: 'department', message: 'Department is required' };
    if (!career?.role_category?.trim()) return { field: 'role_category', message: 'Role category is required' };
    if (!career?.job_role?.trim()) return { field: 'job_role', message: 'Job role is required' };

    // Optional field validations (enum values) - trim before checking
    const validJobTypes = ['Full-time', 'Part-time', 'Contract', 'Internship', 'Freelance'];
    if (career?.desired_job_type) {
      const jobType = career.desired_job_type?.trim?.() || career.desired_job_type;
      if (!validJobTypes.includes(jobType)) {
        return { field: 'desired_job_type', message: 'Invalid job type. Allowed: Full-time, Part-time, Contract, Internship, Freelance' };
      }
    }

    const validEmploymentTypes = ['Permanent', 'Temporary', 'Contractual'];
    if (career?.desired_employment_type) {
      const empType = career.desired_employment_type?.trim?.() || career.desired_employment_type;
      if (!validEmploymentTypes.includes(empType)) {
        return { field: 'desired_employment_type', message: 'Invalid employment type. Allowed: Permanent, Temporary, Contractual' };
      }
    }

    const validShifts = ['Day Shift', 'Night Shift', 'Flexible'];
    if (career?.preferred_shift) {
      const shift = career.preferred_shift?.trim?.() || career.preferred_shift;
      if (!validShifts.includes(shift)) {
        return { field: 'preferred_shift', message: 'Invalid shift. Allowed: Day Shift, Night Shift, Flexible' };
      }
    }

    const validLocations = ['Remote', 'On-site', 'Hybrid'];
    if (career?.preferred_work_location) {
      const locations = Array.isArray(career.preferred_work_location)
        ? career.preferred_work_location
        : [career.preferred_work_location];
      for (const loc of locations) {
        const location = loc?.trim?.() || loc;
        if (!validLocations.includes(location)) {
          return { field: 'preferred_work_location', message: 'Invalid location. Allowed: Remote, On-site, Hybrid' };
        }
      }
    }

    return null;
  }

  static validatePersonalDetails(details: any): ValidationError | null {
    if (!details?.gender?.trim()) return { field: 'gender', message: 'Gender is required' };
    if (!details?.marital_status?.trim()) return { field: 'marital_status', message: 'Marital status is required' };
    if (!details?.date_of_birth?.trim()) return { field: 'date_of_birth', message: 'Date of birth is required' };
    if (!details?.address?.trim()) return { field: 'address', message: 'Address is required' };

    const validLangs = (details?.languages || []).filter((l: any) => l.name?.trim());
    if (validLangs.length === 0) return { field: 'languages', message: 'Please add at least one language' };

    return null;
  }

  static validateRecruiterVisibility(data: any): ValidationError | null {
    if (typeof data?.recruiter_visible !== 'boolean') {
      return { field: 'recruiter_visible', message: 'Visibility status must be enabled or disabled' };
    }

    if (!Array.isArray(data?.open_to_job_types)) {
      return { field: 'open_to_job_types', message: 'Job types must be an array' };
    }

    if (data.recruiter_visible && data.open_to_job_types.length === 0) {
      return { field: 'open_to_job_types', message: 'Select at least one job type when visible to recruiters' };
    }

    return null;
  }
}
