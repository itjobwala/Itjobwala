'use client';

import { useState } from 'react';
import SmartNavbar from '@/src/components/SmartNavbar';
import { useToast } from '@/src/hooks/useToast';
import Toast from '@/src/components/ui/Toast';
import ProtectedRoute from '@/src/components/auth/ProtectedRoute';
import ProfileHeader from './ProfileHeader';
import AboutSection from './AboutSection';
import SkillsSection from './SkillsSection';
import ExperienceSection from './ExperienceSection';
import EducationSection from './EducationSection';
import CertificationsSection from './CertificationsSection';
import CareerProfileSection from './CareerProfileSection';
import PersonalDetailsSection from './PersonalDetailsSection';
import ResumeCard from './ResumeCard';
import Card from '@/src/components/ui/Card';
import ProfileCompletionCard from './ProfileCompletionCard';
import AppliedJobsCard from './AppliedJobsCard';
import SavedJobsCard from './SavedJobsCard';
import RecruiterVisibilityCard from './RecruiterVisibilityCard';
import ProfileSkeleton from './ProfileSkeleton';
import ProfileModal from './ProfileModal';
import EditProfileHeader from './EditProfileHeader';
import EditAboutSection from './EditAboutSection';
import EditSkillsSection from './EditSkillsSection';
import EditExperienceSection from './EditExperienceSection';
import EditEducationSection from './EditEducationSection';
import EditCertificationSection from './EditCertificationSection';
import EditCareerProfileSection from './EditCareerProfileSection';
import EditPersonalDetailsSection from './EditPersonalDetailsSection';
import ResumeUploadModal from './ResumeUploadModal';
import ProfilePhotoUploadModal from './ProfilePhotoUploadModal';
import CoverUploadModal from './CoverUploadModal';
import {
  useCandidateProfileQuery,
  useUpdateProfileMutation,
  useUpdateSkillsMutation,
  useAddExperienceMutation,
  useUpdateExperienceMutation,
  useDeleteExperienceMutation,
  useAddEducationMutation,
  useUpdateEducationMutation,
  useDeleteEducationMutation,
  useAddCertificationMutation,
  useUpdateCertificationMutation,
  useDeleteCertificationMutation,
  useUploadResumeMutation,
  useUploadProfilePhotoMutation,
  useUploadCertificateFileMutation,
  useUploadProfileCoverMutation,
} from '@/src/hooks/useProfile';
import { useQueryClient } from '@tanstack/react-query';
import { useMyApplicationsQuery, useSavedJobsQuery, useUnsaveJobMutation } from '@/src/hooks/useApplications';
import { useAuthHydration } from '@/src/hooks/useAuthHydration';
import { useProfileManager } from '@/src/hooks/useProfileManager';
import { ProfileValidator, type ValidationError } from '@/src/lib/validation/profile';
import { getResumeUploadDate, buildProfileUpdatePayload } from '@/src/lib/utils/profile';

type ModalType = 'personal-info' | 'about' | 'skills' | 'career-profile' | 'personal-details' | 'experience' | 'add-experience' | 'education' | 'add-education' | 'certifications' | 'add-certifications' | 'resume-upload' | 'profile-photo-upload' | 'profile-cover-upload' | null;

export default function ProfilePageClient() {
  const { isHydrated, session, isLoading: authLoading } = useAuthHydration();
  const canLoadCandidateData = isHydrated && !authLoading && session?.userRole === 'candidate';
  const { data: profile, isLoading: profileLoading } = useCandidateProfileQuery(canLoadCandidateData);
  const { data: appsData, isLoading: appsLoading } = useMyApplicationsQuery({ limit: 5 }, canLoadCandidateData);
  const { data: savedData, isLoading: savedLoading } = useSavedJobsQuery({ limit: 5 }, canLoadCandidateData);
  const unsaveMutation = useUnsaveJobMutation();
  const updateProfileMutation = useUpdateProfileMutation();
  const updateSkillsMutation = useUpdateSkillsMutation();
  const addExperienceMutation = useAddExperienceMutation();
  const updateExperienceMutation = useUpdateExperienceMutation();
  const deleteExperienceMutation = useDeleteExperienceMutation();
  const addEducationMutation = useAddEducationMutation();
  const updateEducationMutation = useUpdateEducationMutation();
  const deleteEducationMutation = useDeleteEducationMutation();
  const addCertificationMutation = useAddCertificationMutation();
  const updateCertificationMutation = useUpdateCertificationMutation();
  const deleteCertificationMutation = useDeleteCertificationMutation();
  const uploadResumeMutation = useUploadResumeMutation();
  const uploadProfilePhotoMutation = useUploadProfilePhotoMutation();
  const uploadCertificateFileMutation = useUploadCertificateFileMutation();
  const uploadProfileCoverMutation = useUploadProfileCoverMutation();
  const queryClient = useQueryClient();

  const { activeModal, draft, saving, openEditModal, closeModal, setSaving: setSavingState, updateDraft } = useProfileManager(profile);

  const { toast, show: showToast } = useToast();

  const loading = profileLoading || appsLoading || savedLoading;
  const applications = appsData?.applications ?? [];
  const savedJobs = savedData?.saved_jobs ?? [];

  const showError = (msg: string) => showToast(msg, 'error');

  const validateModal = (): ValidationError | null => {
    switch (activeModal) {
      case 'personal-info':
        return ProfileValidator.validatePersonalInfo(draft.profile);
      case 'about':
        return ProfileValidator.validateAbout(draft.about);
      case 'experience':
      case 'add-experience':
        return ProfileValidator.validateExperience(draft.experience[0]);
      case 'education':
      case 'add-education':
        return ProfileValidator.validateEducation(draft.education[0]);
      case 'certifications':
      case 'add-certifications':
        return ProfileValidator.validateCertification(draft.certifications[0]);
      case 'skills':
        return ProfileValidator.validateSkills(draft.skills);
      case 'career-profile':
        return ProfileValidator.validateCareerProfile(draft.careerProfile);
      case 'personal-details':
        return ProfileValidator.validatePersonalDetails(draft.personalDetails);
      default:
        return null;
    }
  };

  const trimExperience = (exp: any) => ({
    company: exp.company?.trim?.() || '',
    role: exp.role?.trim?.() || '',
    employment_type: exp.employment_type?.trim?.() || '',
    location: exp.location?.trim?.() || exp.location,
    description: exp.description?.trim?.() || exp.description,
    start_date: exp.start_date || '',
    end_date: exp.is_current ? null : (exp.end_date || null),
    is_current: exp.is_current || false,
    skills: exp.skills || [],
  });

  const handleDelete = async (itemId: string | number) => {
    setSavingState(true);
    try {
      switch (activeModal) {
        case 'experience':
          await deleteExperienceMutation.mutateAsync(String(itemId));
          break;
        case 'education':
          await deleteEducationMutation.mutateAsync(String(itemId));
          break;
        case 'certifications':
          await deleteCertificationMutation.mutateAsync(String(itemId));
          break;
        default:
          return;
      }
      closeModal();
    } catch (error: any) {
      const message = error?.response?.data?.message || (error as Error).message || 'Failed to delete. Please try again.';
      showError(message);
    } finally {
      setSavingState(false);
    }
  };

  const handleSave = async () => {
    const validationError = validateModal();
    if (validationError) {
      return showError(validationError.message);
    }

    setSavingState(true);
    try {
      switch (activeModal) {
        case 'add-experience': {
          const experienceData = trimExperience(draft.experience[0]);
          await addExperienceMutation.mutateAsync(experienceData);
          break;
        }
        case 'experience': {
          const experienceData = trimExperience(draft.experience[0]);
          await updateExperienceMutation.mutateAsync({
            id: String(draft.experience[0].id),
            data: experienceData,
          });
          break;
        }
        case 'add-education': {
          const { id, ...educationData } = draft.education[0];
          const trimmedEducation = {
            institution: educationData.institution?.trim?.() || '',
            degree: educationData.degree?.trim?.() || '',
            field_of_study: educationData.field_of_study?.trim?.() || '',
            location: educationData.location?.trim?.() || educationData.location,
            grade: educationData.grade?.trim?.() || educationData.grade,
            start_date: educationData.start_date || '',
            end_date: educationData.is_current ? null : (educationData.end_date || null),
            is_current: educationData.is_current || false,
          };
          await addEducationMutation.mutateAsync(trimmedEducation);
          break;
        }
        case 'education': {
          const { id, ...educationData } = draft.education[0];
          const trimmedEducation = {
            institution: educationData.institution?.trim?.() || '',
            degree: educationData.degree?.trim?.() || '',
            field_of_study: educationData.field_of_study?.trim?.() || '',
            location: educationData.location?.trim?.() || educationData.location,
            grade: educationData.grade?.trim?.() || educationData.grade,
            start_date: educationData.start_date || '',
            end_date: educationData.is_current ? null : (educationData.end_date || null),
            is_current: educationData.is_current || false,
          };
          await updateEducationMutation.mutateAsync({
            id: String(draft.education[0].id),
            data: trimmedEducation,
          });
          break;
        }
        case 'add-certifications': {
          const cert = draft.certifications[0] as any;
          const selectedFile = cert.selectedFile;
          const trimmedCert = {
            name: cert.name?.trim?.() || '',
            issuer: cert.issuer?.trim?.() || '',
            issue_date: cert.issue_date || '',
          };
          await addCertificationMutation.mutateAsync(trimmedCert);

          // Upload certificate file if selected
          // Find the newly created certification from updated profile
          if (selectedFile) {
            setTimeout(async () => {
              const updatedProfile = await queryClient.getQueryData(['candidate', 'profile']) as any;
              const newCert = updatedProfile?.certifications?.find(
                (c: any) =>
                  c.name === trimmedCert.name &&
                  c.issuer === trimmedCert.issuer &&
                  c.issue_date === trimmedCert.issue_date
              );

              if (newCert?.id) {
                try {
                  await uploadCertificateFileMutation.mutateAsync({
                    certId: String(newCert.id),
                    file: selectedFile,
                  });
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
          const selectedFile = cert.selectedFile;
          const trimmedCert = {
            name: cert.name?.trim?.() || '',
            issuer: cert.issuer?.trim?.() || '',
            issue_date: cert.issue_date || '',
          };
          await updateCertificationMutation.mutateAsync({
            id: String(draft.certifications[0].id),
            data: trimmedCert,
          });

          // Upload certificate file if selected
          if (selectedFile) {
            try {
              await uploadCertificateFileMutation.mutateAsync({
                certId: String(draft.certifications[0].id),
                file: selectedFile,
              });
            } catch (err) {
              console.error('Certificate file upload failed:', err);
            }
          }
          break;
        }
        case 'skills': {
          const trimmedSkills = draft.skills.map((skill: string) => skill.trim()).filter((skill: string) => skill);
          await updateSkillsMutation.mutateAsync({ skills: trimmedSkills });
          break;
        }
        default:
          // Handle profile updates (personal-info, about, skills, career-profile, personal-details)
          if (profile) {
            const payload = buildProfileUpdatePayload(profile, activeModal, draft);
            await updateProfileMutation.mutateAsync(payload);
          }
      }
      closeModal();
    } catch (error) {
      showError((error as Error).message || 'Failed to save. Please try again.');
    } finally {
      setSavingState(false);
    }
  };

  const renderModal = (isOpen: boolean, title: string, children: React.ReactNode) => (
    <ProfileModal
      isOpen={isOpen}
      onClose={closeModal}
      onSave={handleSave}
      isSaving={saving}
      title={title}
    >
      {children}
    </ProfileModal>
  );

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#f9fafb]">
        <SmartNavbar />

        <div className="pt-[68px]">
          {/* Top bar */}
          <div className="bg-white border-b border-gray-100">
            <div className="max-w-[1200px] mx-auto px-5 sm:px-8 py-5">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-[18px] font-extrabold text-[#0f172a]" style={{ letterSpacing: '-0.3px' }}>
                    My Profile
                  </h1>
                  <p className="text-[13px] text-gray-400 mt-0.5">
                    Manage your profile and track job activity
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="max-w-[1200px] mx-auto px-5 sm:px-8 py-8">
            {loading || !profile ? (
              <ProfileSkeleton />
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 items-start">
                {/* Left column */}
                <div className="flex flex-col gap-5 min-w-0">
                  <ProfileHeader
                    profile={profile}
                    onEdit={() => openEditModal('personal-info')}
                    onUploadPhoto={() => openEditModal('profile-photo-upload')}
                    onUploadCover={() => openEditModal('profile-cover-upload')}
                  />
                  {profile.resume ? (
                    <ResumeCard
                      fileName={profile.resume.file_name}
                      uploadDate={getResumeUploadDate(profile.resume.uploaded_at)}
                      fileUrl={profile.resume.url}
                      onEdit={() => openEditModal('resume-upload')}
                    />
                  ) : (
                    <Card padding="none" className="p-6 sm:p-8" overflow>
                      <h2 className="text-[16px] font-extrabold text-[#0f172a] mb-4" style={{ letterSpacing: '-0.3px' }}>Resume</h2>
                      <button
                        onClick={() => openEditModal('resume-upload')}
                        className="w-full flex flex-col items-center justify-center py-8 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 hover:border-primary/40 hover:text-primary transition-colors"
                      >
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mb-2">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                          <polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
                        </svg>
                        <span className="text-[13px] font-semibold">Upload your resume</span>
                      </button>
                      <p className="text-[12px] text-gray-400 mt-3 text-center">
                        Accepted formats: PDF, DOC, DOCX • Max 5 MB
                      </p>
                    </Card>
                  )}
                  <AboutSection about={profile.about ?? profile.bio ?? ''} onEdit={() => openEditModal('about')} />
                  <CareerProfileSection careerProfile={profile.career_profile} expectedSalary={profile.expected_salary != null ? Number(profile.expected_salary) : undefined} onEdit={() => openEditModal('career-profile')} onAdd={() => openEditModal('career-profile')} />
                  <PersonalDetailsSection personalDetails={profile.personal_details} onEdit={() => openEditModal('personal-details')} onAdd={() => openEditModal('personal-details')} />
                  <SkillsSection skills={profile.skills} onEdit={() => openEditModal('skills')} />
                  <ExperienceSection
                    experiences={profile.experience}
                    onEdit={(id) => openEditModal('experience', id)}
                    onAdd={() => openEditModal('add-experience')}
                  />
                  <EducationSection
                    education={profile.education}
                    onEdit={(id) => openEditModal('education', id)}
                    onAdd={() => openEditModal('add-education')}
                  />
                  <CertificationsSection
                    certifications={profile.certifications}
                    onEdit={(id) => openEditModal('certifications', id)}
                    onAdd={() => openEditModal('add-certifications')}
                  />
                </div>

                {/* Right sidebar */}
                <div className="flex flex-col gap-5 lg:sticky lg:top-24">
                  <ProfileCompletionCard />
                  <RecruiterVisibilityCard />
                  <AppliedJobsCard jobs={applications} />
                  <SavedJobsCard
                    jobs={savedJobs}
                    total={savedData?.pagination?.total}
                    hasMore={savedData?.pagination?.has_next}
                    onUnsave={jobId => unsaveMutation.mutate(jobId)}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modals */}
        {renderModal(
          activeModal === 'personal-info',
          'Edit Personal Info',
          <EditProfileHeader profile={draft.profile} onChange={(p) => updateDraft({ profile: p })} profilePhotoUrl={profile?.profile_photo_url} />
        )}

        {renderModal(
          activeModal === 'about',
          'Edit About',
          <EditAboutSection value={draft.about} onChange={(a) => updateDraft({ about: a })} />
        )}

        {renderModal(
          activeModal === 'skills',
          'Edit Skills',
          <EditSkillsSection skills={draft.skills} onChange={(s) => updateDraft({ skills: s })} />
        )}

        {renderModal(
          activeModal === 'career-profile',
          'Career Profile',
          <EditCareerProfileSection profile={draft.careerProfile} onChange={(c) => updateDraft({ careerProfile: c })} />
        )}

        {renderModal(
          activeModal === 'personal-details',
          'Personal Details',
          <EditPersonalDetailsSection profile={draft.personalDetails} onChange={(p) => updateDraft({ personalDetails: p })} />
        )}

        {renderModal(
          activeModal === 'experience' || activeModal === 'add-experience',
          activeModal === 'add-experience' ? 'Add Experience' : 'Edit Experience',
          <EditExperienceSection
            experiences={draft.experience as any}
            onChange={(e) => updateDraft({ experience: e as any })}
            onDelete={activeModal === 'experience' ? (id) => handleDelete(id) : undefined}
          />
        )}

        {renderModal(
          activeModal === 'education' || activeModal === 'add-education',
          activeModal === 'add-education' ? 'Add Education' : 'Edit Education',
          <EditEducationSection education={draft.education as any} onChange={(e) => updateDraft({ education: e as any })} onDelete={activeModal === 'education' ? (id) => handleDelete(id) : undefined} />
        )}

        {renderModal(
          activeModal === 'certifications' || activeModal === 'add-certifications',
          activeModal === 'add-certifications' ? 'Add Certification' : 'Edit Certification',
          <EditCertificationSection certifications={draft.certifications as any} onChange={(c) => updateDraft({ certifications: c as any })} onDelete={activeModal === 'certifications' ? (id) => handleDelete(id) : undefined} />
        )}

        {/* Resume Upload Modal */}
        <ResumeUploadModal
          isOpen={activeModal === 'resume-upload'}
          onClose={closeModal}
          onUpload={(file, onProgress) => uploadResumeMutation.mutateAsync({ file, onProgress }).then(() => {})}
          isUploading={uploadResumeMutation.isPending}
          currentResume={profile?.resume}
        />

        {/* Profile Photo Upload Modal */}
        <ProfilePhotoUploadModal
          isOpen={activeModal === 'profile-photo-upload'}
          onClose={closeModal}
          onUpload={(file, onProgress) => uploadProfilePhotoMutation.mutateAsync({ file, onProgress }).then(() => {})}
          isUploading={uploadProfilePhotoMutation.isPending}
        />

        {/* Cover Upload Modal */}
        <CoverUploadModal
          isOpen={activeModal === 'profile-cover-upload'}
          onClose={closeModal}
          onUpload={(file, onProgress) => uploadProfileCoverMutation.mutateAsync({ file, onProgress }).then(() => {})}
          isUploading={uploadProfileCoverMutation.isPending}
        />

        <Toast message={toast.message} variant={toast.variant} visible={toast.visible} />
      </div>
    </ProtectedRoute>
  );
}
