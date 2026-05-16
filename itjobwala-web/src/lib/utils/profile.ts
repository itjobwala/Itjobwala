import type { CandidateProfile, WorkExperience, Education, Certification } from '@/src/types/profile';

export function getRelativeDate(isoString: string): string {
  const diff = Math.floor((Date.now() - new Date(isoString).getTime()) / 86_400_000);
  if (diff === 0) return 'Today';
  if (diff === 1) return '1 day ago';
  if (diff < 7) return `${diff} days ago`;
  if (diff < 14) return '1 week ago';
  return `${Math.floor(diff / 7)} weeks ago`;
}

export function getResumeUploadDate(uploadedAt: string | undefined): string {
  if (!uploadedAt) return '';
  return `Updated ${getRelativeDate(uploadedAt)}`;
}

export function updateProfileField<T extends Record<string, any>>(
  profile: T,
  updates: Partial<T>
): T {
  return { ...profile, ...updates };
}

export function addExperience(
  experiences: WorkExperience[],
  newExp: WorkExperience
): WorkExperience[] {
  return [...experiences, newExp];
}

export function updateExperience(
  experiences: WorkExperience[],
  id: string,
  updated: WorkExperience
): WorkExperience[] {
  return experiences.map(exp => (exp.id === id ? updated : exp));
}

export function deleteExperience(
  experiences: WorkExperience[],
  id: string
): WorkExperience[] {
  return experiences.filter(exp => exp.id !== id);
}

export function addEducation(
  education: Education[],
  newEdu: Education
): Education[] {
  return [...education, newEdu];
}

export function updateEducation(
  education: Education[],
  id: string,
  updated: Education
): Education[] {
  return education.map(edu => (edu.id === id ? updated : edu));
}

export function deleteEducation(
  education: Education[],
  id: string
): Education[] {
  return education.filter(edu => edu.id !== id);
}

export function addCertification(
  certifications: Certification[],
  newCert: Certification
): Certification[] {
  return [...certifications, newCert];
}

export function updateCertification(
  certifications: Certification[],
  id: string,
  updated: Certification
): Certification[] {
  return certifications.map(cert => (cert.id === id ? updated : cert));
}

export function deleteCertification(
  certifications: Certification[],
  id: string
): Certification[] {
  return certifications.filter(cert => cert.id !== id);
}

export function buildProfileUpdatePayload(
  profile: CandidateProfile,
  activeModal: string | null,
  draft: any
): any {
  switch (activeModal) {
    case 'personal-info':
      return {
        first_name: draft.profile?.firstName ?? profile.first_name,
        last_name: draft.profile?.lastName ?? profile.last_name,
        email: draft.profile?.email ?? profile.email,
        title: draft.profile?.title ?? profile.title,
        phone: draft.profile?.phone ?? profile.phone,
        location: draft.profile?.location ?? profile.location,
        experience_years: draft.profile?.experienceYears ? Number(draft.profile.experienceYears) : profile.experience_years,
        current_salary: draft.profile?.currentSalary ? Number(draft.profile.currentSalary) : profile.current_salary,
        expected_salary: draft.profile?.expectedSalary ? Number(draft.profile.expectedSalary) : profile.expected_salary,
        work_status: draft.profile?.workStatus ?? profile.work_status,
        availability_to_join: draft.profile?.availabilityToJoin ?? profile.availability_to_join,
        open_to_work: draft.profile?.openToWork ?? profile.open_to_work,
        github: draft.profile?.github ?? profile.github,
        linked_in: draft.profile?.linkedIn ?? profile.linked_in,
        about: draft.profile?.about ?? profile.about,
      };

    case 'about':
      return {
        first_name: profile.first_name,
        last_name: profile.last_name,
        email: profile.email,
        title: profile.title,
        phone: profile.phone,
        location: profile.location,
        experience_years: profile.experience_years,
        current_salary: profile.current_salary,
        expected_salary: profile.expected_salary,
        work_status: profile.work_status,
        availability_to_join: profile.availability_to_join,
        open_to_work: profile.open_to_work,
        github: profile.github,
        linked_in: profile.linked_in,
        about: draft.about ?? '',
      };

    case 'skills':
      // Skills are handled via dedicated PUT /candidate/profile/skills endpoint
      return {
        first_name: profile.first_name,
        last_name: profile.last_name,
        email: profile.email,
        title: profile.title,
        phone: profile.phone,
        location: profile.location,
        experience_years: profile.experience_years,
        current_salary: profile.current_salary,
        expected_salary: profile.expected_salary,
        work_status: profile.work_status,
        availability_to_join: profile.availability_to_join,
        open_to_work: profile.open_to_work,
        github: profile.github ?? '',
        linked_in: profile.linked_in ?? '',
        about: profile.about ?? '',
      };

    case 'career-profile': {
      const careerProfile: any = {
        current_industry: draft.careerProfile?.current_industry?.trim?.() || profile.career_profile?.current_industry?.trim?.() || '',
        department: draft.careerProfile?.department?.trim?.() || profile.career_profile?.department?.trim?.() || '',
        role_category: draft.careerProfile?.role_category?.trim?.() || profile.career_profile?.role_category?.trim?.() || '',
        job_role: draft.careerProfile?.job_role?.trim?.() || profile.career_profile?.job_role?.trim?.() || '',
      };

      // Include optional fields only if they have values (trim them)
      if (draft.careerProfile?.desired_job_type || profile.career_profile?.desired_job_type) {
        const jobType = (draft.careerProfile?.desired_job_type || profile.career_profile?.desired_job_type)?.trim?.();
        if (jobType) careerProfile.desired_job_type = jobType;
      }
      if (draft.careerProfile?.desired_employment_type || profile.career_profile?.desired_employment_type) {
        const empType = (draft.careerProfile?.desired_employment_type || profile.career_profile?.desired_employment_type)?.trim?.();
        if (empType) careerProfile.desired_employment_type = empType;
      }
      if (draft.careerProfile?.preferred_shift || profile.career_profile?.preferred_shift) {
        const shift = (draft.careerProfile?.preferred_shift || profile.career_profile?.preferred_shift)?.trim?.();
        if (shift) careerProfile.preferred_shift = shift;
      }
      if (draft.careerProfile?.preferred_work_location || profile.career_profile?.preferred_work_location) {
        const locations = draft.careerProfile?.preferred_work_location || profile.career_profile?.preferred_work_location;
        if (Array.isArray(locations)) {
          careerProfile.preferred_work_location = locations.map((loc: any) => loc?.trim?.() || loc).filter((loc: any) => loc);
        } else if (locations) {
          const trimmedLoc = locations?.trim?.();
          if (trimmedLoc) careerProfile.preferred_work_location = trimmedLoc;
        }
      }

      return {
        first_name: profile.first_name,
        last_name: profile.last_name,
        email: profile.email,
        title: profile.title,
        phone: profile.phone,
        location: profile.location,
        experience_years: profile.experience_years,
        current_salary: profile.current_salary,
        expected_salary: draft.careerProfile?.expected_salary || profile.expected_salary,
        work_status: profile.work_status,
        availability_to_join: profile.availability_to_join,
        open_to_work: profile.open_to_work,
        github: profile.github ?? '',
        linked_in: profile.linked_in ?? '',
        about: profile.about ?? '',
        career_profile: careerProfile,
      };
    }

    case 'personal-details':
      return {
        first_name: profile.first_name,
        last_name: profile.last_name,
        email: profile.email,
        title: profile.title,
        phone: profile.phone,
        location: profile.location,
        experience_years: profile.experience_years,
        current_salary: profile.current_salary,
        expected_salary: profile.expected_salary,
        work_status: profile.work_status,
        availability_to_join: profile.availability_to_join,
        open_to_work: profile.open_to_work,
        github: profile.github ?? '',
        linked_in: profile.linked_in ?? '',
        about: profile.about ?? '',
        personal_details: {
          gender: draft.personalDetails?.gender ?? profile.personal_details?.gender ?? '',
          marital_status: draft.personalDetails?.marital_status ?? profile.personal_details?.marital_status ?? '',
          date_of_birth: draft.personalDetails?.date_of_birth ?? profile.personal_details?.date_of_birth ?? '',
          category: draft.personalDetails?.category ?? profile.personal_details?.category ?? '',
          work_permit: draft.personalDetails?.work_permit ?? profile.personal_details?.work_permit ?? '',
          address: draft.personalDetails?.address ?? profile.personal_details?.address ?? '',
          languages: (draft.personalDetails?.languages || []).filter((lang: any) => lang.name?.trim?.()),
        },
      };

    default:
      return {};
  }
}
