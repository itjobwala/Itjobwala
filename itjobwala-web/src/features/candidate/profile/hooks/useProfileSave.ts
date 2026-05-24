'use client';

import { useQueryClient } from '@tanstack/react-query';
import type { CandidateProfile } from '../types/profile.types';
import { ProfileValidator } from '../schemas/profile.schema';
import type { ValidationError } from '../schemas/profile.schema';
import { buildProfileUpdatePayload } from '@/src/lib/utils/profile';
type ModalType = 'personal-info' | 'about' | 'skills' | 'career-profile' | 'personal-details' | 'experience' | 'add-experience' | 'education' | 'add-education' | 'certifications' | 'add-certifications' | 'resume-upload' | 'profile-photo-upload' | 'profile-cover-upload' | null;

interface Mutations {
  updateProfile:          { mutateAsync: (data: any) => Promise<any> };
  updateSkills:           { mutateAsync: (data: any) => Promise<any> };
  addExperience:          { mutateAsync: (data: any) => Promise<any> };
  updateExperience:       { mutateAsync: (data: { id: string; data: any }) => Promise<any> };
  deleteExperience:       { mutateAsync: (id: string) => Promise<any> };
  addEducation:           { mutateAsync: (data: any) => Promise<any> };
  updateEducation:        { mutateAsync: (data: { id: string; data: any }) => Promise<any> };
  deleteEducation:        { mutateAsync: (id: string) => Promise<any> };
  addCertification:       { mutateAsync: (data: any) => Promise<any> };
  updateCertification:    { mutateAsync: (data: { id: string; data: any }) => Promise<any> };
  deleteCertification:    { mutateAsync: (id: string) => Promise<any> };
  uploadCertificateFile:  { mutateAsync: (data: { certId: string; file: File }) => Promise<any> };
}

interface Options {
  profile: CandidateProfile | undefined;
  activeModal: ModalType;
  draft: any;
  closeModal: () => void;
  setSaving: (v: boolean) => void;
  showError: (msg: string) => void;
  mutations: Mutations;
}

function trimExperience(exp: any) {
  return {
    company:          exp.company?.trim?.() || '',
    role:             exp.role?.trim?.() || '',
    employment_type:  exp.employment_type?.trim?.() || '',
    location:         exp.location?.trim?.() || exp.location,
    description:      exp.description?.trim?.() || exp.description,
    start_date:       exp.start_date || '',
    end_date:         exp.is_current ? null : (exp.end_date || null),
    is_current:       exp.is_current || false,
    skills:           exp.skills || [],
  };
}

export function useProfileSave({
  profile,
  activeModal,
  draft,
  closeModal,
  setSaving,
  showError,
  mutations,
}: Options) {
  const queryClient = useQueryClient();

  function validateModal(): ValidationError | null {
    switch (activeModal) {
      case 'personal-info':    return ProfileValidator.validatePersonalInfo(draft.profile);
      case 'about':            return ProfileValidator.validateAbout(draft.about);
      case 'experience':
      case 'add-experience':   return ProfileValidator.validateExperience(draft.experience[0]);
      case 'education':
      case 'add-education':    return ProfileValidator.validateEducation(draft.education[0]);
      case 'certifications':
      case 'add-certifications': return ProfileValidator.validateCertification(draft.certifications[0]);
      case 'skills':           return ProfileValidator.validateSkills(draft.skills);
      case 'career-profile':   return ProfileValidator.validateCareerProfile(draft.careerProfile);
      case 'personal-details': return ProfileValidator.validatePersonalDetails(draft.personalDetails);
      default:                 return null;
    }
  }

  async function handleDelete(itemId: string | number) {
    setSaving(true);
    try {
      switch (activeModal) {
        case 'experience':      await mutations.deleteExperience.mutateAsync(String(itemId)); break;
        case 'education':       await mutations.deleteEducation.mutateAsync(String(itemId)); break;
        case 'certifications':  await mutations.deleteCertification.mutateAsync(String(itemId)); break;
        default: return;
      }
      closeModal();
    } catch (error: any) {
      showError(error?.response?.data?.message || (error as Error).message || 'Failed to delete. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  async function handleSave() {
    const validationError = validateModal();
    if (validationError) return showError(validationError.message);

    if (activeModal === 'personal-info') {
      const s = draft.profile?.currentSalary;
      if (s !== '' && s != null) {
        const n = Number(s);
        if (isNaN(n) || n <= 0) return showError('Current salary must be greater than 0');
      }
    }
    if (activeModal === 'career-profile') {
      const s = draft.careerProfile?.expected_salary;
      if (s !== '' && s != null) {
        const n = Number(s);
        if (isNaN(n) || n <= 0) return showError('Expected salary must be greater than 0');
      }
    }

    setSaving(true);
    try {
      switch (activeModal) {
        case 'add-experience': {
          await mutations.addExperience.mutateAsync(trimExperience(draft.experience[0]));
          break;
        }
        case 'experience': {
          await mutations.updateExperience.mutateAsync({
            id: String(draft.experience[0].id),
            data: trimExperience(draft.experience[0]),
          });
          break;
        }
        case 'add-education': {
          const { id: _id, ...educationData } = draft.education[0];
          await mutations.addEducation.mutateAsync({
            institution:    educationData.institution?.trim?.() || '',
            degree:         educationData.degree?.trim?.() || '',
            field_of_study: educationData.field_of_study?.trim?.() || '',
            location:       educationData.location?.trim?.() || educationData.location,
            grade:          educationData.grade?.trim?.() || educationData.grade,
            start_date:     educationData.start_date || '',
            end_date:       educationData.is_current ? null : (educationData.end_date || null),
            is_current:     educationData.is_current || false,
          });
          break;
        }
        case 'education': {
          const { id: _id, ...educationData } = draft.education[0];
          await mutations.updateEducation.mutateAsync({
            id: String(draft.education[0].id),
            data: {
              institution:    educationData.institution?.trim?.() || '',
              degree:         educationData.degree?.trim?.() || '',
              field_of_study: educationData.field_of_study?.trim?.() || '',
              location:       educationData.location?.trim?.() || educationData.location,
              grade:          educationData.grade?.trim?.() || educationData.grade,
              start_date:     educationData.start_date || '',
              end_date:       educationData.is_current ? null : (educationData.end_date || null),
              is_current:     educationData.is_current || false,
            },
          });
          break;
        }
        case 'add-certifications': {
          const cert = draft.certifications[0] as any;
          const trimmedCert = {
            name:       cert.name?.trim?.() || '',
            issuer:     cert.issuer?.trim?.() || '',
            issue_date: cert.issue_date || '',
          };
          await mutations.addCertification.mutateAsync(trimmedCert);
          if (cert.selectedFile) {
            setTimeout(async () => {
              const updatedProfile = await queryClient.getQueryData(['candidate', 'profile']) as any;
              const newCert = updatedProfile?.certifications?.find(
                (c: any) => c.name === trimmedCert.name && c.issuer === trimmedCert.issuer && c.issue_date === trimmedCert.issue_date
              );
              if (newCert?.id) {
                try {
                  await mutations.uploadCertificateFile.mutateAsync({ certId: String(newCert.id), file: cert.selectedFile });
                } catch (err) {
                  console.error('Certificate file upload failed:', err);
                }
              }
            }, 100);
          }
          break;
        }
        case 'certifications': {
          const cert = draft.certifications[0] as any;
          const trimmedCert = {
            name:       cert.name?.trim?.() || '',
            issuer:     cert.issuer?.trim?.() || '',
            issue_date: cert.issue_date || '',
          };
          await mutations.updateCertification.mutateAsync({ id: String(draft.certifications[0].id), data: trimmedCert });
          if (cert.selectedFile) {
            try {
              await mutations.uploadCertificateFile.mutateAsync({ certId: String(draft.certifications[0].id), file: cert.selectedFile });
            } catch (err) {
              console.error('Certificate file upload failed:', err);
            }
          }
          break;
        }
        case 'skills': {
          const trimmedSkills = draft.skills.map((s: string) => s.trim()).filter((s: string) => s);
          await mutations.updateSkills.mutateAsync({ skills: trimmedSkills });
          break;
        }
        default:
          if (profile) {
            const payload = buildProfileUpdatePayload(profile, activeModal, draft);
            await mutations.updateProfile.mutateAsync(payload);
          }
      }
      closeModal();
    } catch (error) {
      showError((error as Error).message || 'Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  return { handleSave, handleDelete };
}
