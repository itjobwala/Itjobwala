'use client';

import { useState, useCallback, useEffect } from 'react';
import type { CandidateProfile, WorkExperience, Education, Certification } from '@/features/candidate/profile/types/profile.types';
import { formatDateForInput } from '../utils/profileDate';

type ModalType = 'personal-info' | 'about' | 'skills' | 'career-profile' | 'personal-details' | 'experience' | 'add-experience' | 'education' | 'add-education' | 'certifications' | 'add-certifications' | 'resume-upload' | 'profile-photo-upload' | 'profile-cover-upload' | null;

interface DraftState {
  profile: any;
  about: string;
  skills: string[];
  experience: WorkExperience[];
  education: Education[];
  certifications: Certification[];
  careerProfile: any;
  personalDetails: any;
}

export function useProfileManager(profile: CandidateProfile | null | undefined) {
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [activeModalId, setActiveModalId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const initialDraftState: DraftState = {
    profile: {},
    about: '',
    skills: [],
    experience: [],
    education: [],
    certifications: [],
    careerProfile: {},
    personalDetails: {},
  };

  const [draft, setDraft] = useState<DraftState>(initialDraftState);
  const [snapshot, setSnapshot] = useState<DraftState>(initialDraftState);

  useEffect(() => {
    if (!profile) return;

    const newDraft: DraftState = {
      profile: {
        fullName: [profile.first_name, profile.last_name].filter(Boolean).join(' ') || profile.name || '',
        name: profile.name || '',
        title: profile.title || '',
        experienceYears: profile.experience_years?.toString() || '',
        expectedSalary: profile.expected_salary?.toString() || '',
        currentSalary: (profile.current_salary ? String(profile.current_salary) : '') || '',
        workStatus: profile.work_status || '',
        availabilityToJoin: formatDateForInput(profile.availability_to_join),
        email: profile.email || '',
        phone: profile.phone || '',
        location: profile.location || '',
        github: profile.github || '',
        linkedIn: profile.linked_in || '',
        openToWork: profile.open_to_work || false,
      },
      about: profile.about ?? profile.bio ?? '',
      skills: profile.skills || [],
      careerProfile: {
        current_industry: profile.career_profile?.current_industry || '',
        department: profile.career_profile?.department || '',
        role_category: profile.career_profile?.role_category || '',
        job_role: profile.career_profile?.job_role || '',
        desired_job_type: profile.career_profile?.desired_job_type || '',
        desired_employment_type: profile.career_profile?.desired_employment_type || '',
        preferred_shift: profile.career_profile?.preferred_shift || '',
        preferred_work_location: profile.career_profile?.preferred_work_location || '',
        expected_salary: profile.expected_salary?.toString() || '',
      },
      personalDetails: {
        gender: profile.personal_details?.gender || '',
        marital_status: profile.personal_details?.marital_status || '',
        date_of_birth: profile.personal_details?.date_of_birth || '',
        category: profile.personal_details?.category || '',
        authorized_to_work_in_us: profile.personal_details?.authorized_to_work_in_us ?? false,
        work_permit_other_countries: profile.personal_details?.work_permit_other_countries ?? false,
        address: profile.personal_details?.address || '',
        languages: profile.personal_details?.languages || [],
      },
      experience: getExperienceForModal(profile.experience || [], activeModal, activeModalId),
      education: getEducationForModal(profile.education || [], activeModal, activeModalId),
      certifications: getCertificationsForModal(profile.certifications || [], activeModal, activeModalId),
    };
    setDraft(newDraft);
    setSnapshot(newDraft);
  }, [profile, activeModal, activeModalId]);

  const closeModal = useCallback(() => {
    setActiveModal(null);
    setActiveModalId(null);
  }, []);

  const openEditModal = useCallback((modal: ModalType, id?: string) => {
    setActiveModal(modal);
    setActiveModalId(id || null);
  }, []);

  const setSaving_ = useCallback((isSaving: boolean) => {
    setSaving(isSaving);
  }, []);

  const updateDraft = useCallback((updates: Partial<DraftState>) => {
    setDraft(prev => ({ ...prev, ...updates }));
  }, []);

  const isDirty = JSON.stringify(draft) !== JSON.stringify(snapshot);

  return {
    activeModal,
    activeModalId,
    saving,
    draft,
    isDirty,
    openEditModal,
    closeModal,
    setSaving: setSaving_,
    updateDraft,
  };
}

function getExperienceForModal(
  experiences: WorkExperience[],
  modal: ModalType,
  modalId: string | null
): WorkExperience[] {
  if (modal === 'add-experience' || (modal === 'experience' && experiences.length === 0)) {
    return [{
      id: `exp-${Date.now()}`,
      company: '',
      role: '',
      employment_type: 'Full-time',
      location: '',
      start_date: '',
      end_date: '',
      is_current: false,
      description: '',
      skills: [],
    }];
  }
  return modalId ? experiences.filter(e => String(e.id) === String(modalId)) : experiences;
}

function getEducationForModal(
  education: Education[],
  modal: ModalType,
  modalId: string | null
): Education[] {
  if (modal === 'add-education' || (modal === 'education' && education.length === 0)) {
    return [{
      id: `edu-${Date.now()}`,
      institution: '',
      degree: '',
      field_of_study: '',
      location: '',
      start_date: '',
      end_date: '',
      grade: '',
      is_current: false,
    }];
  }
  return modalId ? education.filter(e => String(e.id) === String(modalId)) : education;
}

function getCertificationsForModal(
  certifications: Certification[],
  modal: ModalType,
  modalId: string | null
): Certification[] {
  if (modal === 'add-certifications' || (modal === 'certifications' && certifications.length === 0)) {
    return [{
      id: `cert-${Date.now()}`,
      name: '',
      issuer: '',
      issue_date: '',
    }];
  }
  return modalId ? certifications.filter(e => String(e.id) === String(modalId)) : certifications;
}

