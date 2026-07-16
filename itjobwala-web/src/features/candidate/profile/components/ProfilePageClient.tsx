'use client';

import { SmartNavbar } from '@/layout/navbar';
import { useToast } from '@/src/hooks/useToast';
import Toast from '@/src/components/ui/Toast';
import { ProtectedRoute } from '@/features/auth';
import Card from '@/src/components/ui/Card';
import ProfileHeader from './ProfileHeader';
import AboutSection from './AboutSection';
import SkillsSection from './SkillsSection';
import ExperienceSection from './ExperienceSection';
import EducationSection from './EducationSection';
import CertificationsSection from './CertificationsSection';
import CareerProfileSection from './CareerProfileSection';
import PersonalDetailsSection from './PersonalDetailsSection';
import ResumeCard from './ResumeCard';
import AppliedJobsCard from './AppliedJobsCard';
import SavedJobsCard from './SavedJobsCard';
import RecruiterVisibilityCard from './RecruiterVisibilityCard';
import ProfileSkeleton from './ProfileSkeleton';
import QueryErrorState from '@/src/components/ui/QueryErrorState';
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
import ProfileCompletionCard from './ProfileCompletionCard';
import Link from 'next/link';
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
} from '../hooks/useProfile';
import { useMyApplicationsQuery, useSavedJobsQuery, useUnsaveJobMutation } from '@/features/candidate/applications/hooks';
import { useAuthHydration } from '@/src/hooks/useAuthHydration';
import { useProfileManager } from '../hooks/useProfileManager';
import { useProfileSave } from '../hooks/useProfileSave';
import { getResumeUploadDate } from '@/src/lib/utils/profile';

export default function ProfilePageClient() {
  const { isHydrated, session, isLoading: authLoading } = useAuthHydration();
  const canLoad = isHydrated && !authLoading && session?.userRole === 'candidate';

  const { data: profile, isLoading: profileLoading, isError: profileError, refetch: refetchProfile } = useCandidateProfileQuery(canLoad);
  const { data: appsData,  isLoading: appsLoading  } = useMyApplicationsQuery({ limit: 5 }, canLoad);
  const { data: savedData, isLoading: savedLoading  } = useSavedJobsQuery({ limit: 5 }, canLoad);
  const unsaveMutation = useUnsaveJobMutation();

  const updateProfileMutation      = useUpdateProfileMutation();
  const updateSkillsMutation       = useUpdateSkillsMutation();
  const addExperienceMutation      = useAddExperienceMutation();
  const updateExperienceMutation   = useUpdateExperienceMutation();
  const deleteExperienceMutation   = useDeleteExperienceMutation();
  const addEducationMutation       = useAddEducationMutation();
  const updateEducationMutation    = useUpdateEducationMutation();
  const deleteEducationMutation    = useDeleteEducationMutation();
  const addCertificationMutation   = useAddCertificationMutation();
  const updateCertificationMutation = useUpdateCertificationMutation();
  const deleteCertificationMutation = useDeleteCertificationMutation();
  const uploadResumeMutation        = useUploadResumeMutation();
  const uploadProfilePhotoMutation  = useUploadProfilePhotoMutation();
  const uploadCertificateFileMutation = useUploadCertificateFileMutation();
  const uploadProfileCoverMutation  = useUploadProfileCoverMutation();

  const { activeModal, draft, saving, isDirty, openEditModal, closeModal, setSaving, updateDraft } =
    useProfileManager(profile);

  const { toast, show: showToast } = useToast();
  const showError = (msg: string) => showToast(msg, 'error');

  const { handleSave, handleDelete } = useProfileSave({
    profile,
    activeModal,
    draft,
    closeModal,
    setSaving,
    showError,
    mutations: {
      updateProfile:         updateProfileMutation,
      updateSkills:          updateSkillsMutation,
      addExperience:         addExperienceMutation,
      updateExperience:      updateExperienceMutation,
      deleteExperience:      deleteExperienceMutation,
      addEducation:          addEducationMutation,
      updateEducation:       updateEducationMutation,
      deleteEducation:       deleteEducationMutation,
      addCertification:      addCertificationMutation,
      updateCertification:   updateCertificationMutation,
      deleteCertification:   deleteCertificationMutation,
      uploadCertificateFile: uploadCertificateFileMutation,
    },
  });

  const loading      = profileLoading || appsLoading || savedLoading;
  const applications = appsData?.applications ?? [];
  const savedJobs    = savedData?.saved_jobs ?? [];

  const modal = (isOpen: boolean, title: string, children: React.ReactNode, saveEnabled?: boolean) => (
    <ProfileModal isOpen={isOpen} onClose={closeModal} onSave={handleSave} isSaving={saving} isDirty={saveEnabled !== undefined ? saveEnabled : isDirty} title={title}>
      {children}
    </ProfileModal>
  );

  const personalInfoSaveEnabled =
    isDirty &&
    !!draft.profile.email?.trim() &&
    draft.profile.email.includes('@') &&
    !!draft.profile.phone?.trim();

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-surface-alt">
        <SmartNavbar />

        <div className="pt-16 lg:pt-[72px]">
          <div className="bg-surface border-b border-token">
            <div className="container-responsive mx-auto px-5 sm:px-8 py-5 flex items-center justify-between">
              <div>
                <h3 className="text-h3 text-heading" style={{ letterSpacing: '-0.3px' }}>My Profile</h3>
                <p className="text-small-text text-subtle mt-0.5">Manage your profile and track job activity</p>
              </div>
            </div>
          </div>

          <div className="container-responsive mx-auto px-5 sm:px-8 py-8">
            {profileError ? (
              <QueryErrorState
                message="We couldn't load your profile. Please check your connection and try again."
                onRetry={() => refetchProfile()}
              />
            ) : loading || !profile ? (
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
                      <h2 className="text-h6 text-heading mb-4" style={{ letterSpacing: '-0.3px' }}>Resume</h2>
                      <button
                        onClick={() => openEditModal('resume-upload')}
                        className="w-full flex flex-col items-center justify-center py-8 border-2 border-dashed border-token rounded-xl text-subtle hover:border-primary/40 hover:text-primary transition-colors"
                      >
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mb-2">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                          <polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
                        </svg>
                        <span className="text-sm font-semibold">Upload your resume</span>
                      </button>
                      <p className="text-caption text-subtle mt-3 text-center">Accepted formats: PDF, DOC, DOCX • Max 5 MB</p>
                    </Card>
                  )}

                  <AboutSection about={profile.about ?? profile.bio ?? ''} onEdit={() => openEditModal('about')} />
                  <CareerProfileSection
                    careerProfile={profile.career_profile}
                    expectedSalary={profile.expected_salary != null ? Number(profile.expected_salary) : undefined}
                    onEdit={() => openEditModal('career-profile')}
                    onAdd={() => openEditModal('career-profile')}
                  />
                  <PersonalDetailsSection
                    personalDetails={profile.personal_details}
                    onEdit={() => openEditModal('personal-details')}
                    onAdd={() => openEditModal('personal-details')}
                  />
                  <SkillsSection skills={profile.skills} onEdit={() => openEditModal('skills')} />
                  <ExperienceSection
                    experiences={profile.experience}
                    onEdit={id => openEditModal('experience', id)}
                    onAdd={() => openEditModal('add-experience')}
                  />
                  <EducationSection
                    education={profile.education}
                    onEdit={id => openEditModal('education', id)}
                    onAdd={() => openEditModal('add-education')}
                  />
                  <CertificationsSection
                    certifications={profile.certifications}
                    onEdit={id => openEditModal('certifications', id)}
                    onAdd={() => openEditModal('add-certifications')}
                  />
                </div>

                {/* Right sidebar */}
                <div className="flex flex-col gap-5 lg:sticky lg:top-24">
                  <ProfileCompletionCard />
                  {/* Resume Intelligence banner — intentional dark violet */}
                  <Link
                    href="/candidate/resume"
                    className="flex items-center justify-between rounded-2xl px-4 py-3.5 transition-all hover:opacity-90 active:scale-[0.98]"
                    style={{
                      background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
                      border: '1px solid rgba(139,92,246,0.25)',
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(139,92,246,0.2)' }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2.2">
                          <circle cx="12" cy="12" r="10"/>
                          <path d="M12 8v4l3 3"/>
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white leading-tight">Resume Intelligence</p>
                        <p className="text-micro text-violet-300 mt-0.5">ATS score · trajectory · risk analysis</p>
                      </div>
                    </div>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2.5">
                      <polyline points="9 18 15 12 9 6"/>
                    </svg>
                  </Link>
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

        {/* ── Modals ── */}
        {modal(activeModal === 'personal-info', 'Edit Personal Info',
          <EditProfileHeader profile={draft.profile} onChange={p => updateDraft({ profile: p })} profilePhotoUrl={profile?.profile_photo_url} />,
          personalInfoSaveEnabled
        )}
        {modal(activeModal === 'about', 'Edit About',
          <EditAboutSection value={draft.about} onChange={a => updateDraft({ about: a })} />
        )}
        {modal(activeModal === 'skills', 'Edit Skills',
          <EditSkillsSection skills={draft.skills} onChange={s => updateDraft({ skills: s })} />
        )}
        {modal(activeModal === 'career-profile', 'Career Profile',
          <EditCareerProfileSection profile={draft.careerProfile} onChange={c => updateDraft({ careerProfile: c })} />
        )}
        {modal(activeModal === 'personal-details', 'Personal Details',
          <EditPersonalDetailsSection profile={draft.personalDetails} onChange={p => updateDraft({ personalDetails: p })} />
        )}
        {modal(
          activeModal === 'experience' || activeModal === 'add-experience',
          activeModal === 'add-experience' ? 'Add Experience' : 'Edit Experience',
          <EditExperienceSection
            experiences={draft.experience as any}
            onChange={e => updateDraft({ experience: e as any })}
            onDelete={activeModal === 'experience' ? id => handleDelete(id) : undefined}
          />
        )}
        {modal(
          activeModal === 'education' || activeModal === 'add-education',
          activeModal === 'add-education' ? 'Add Education' : 'Edit Education',
          <EditEducationSection
            education={draft.education as any}
            onChange={e => updateDraft({ education: e as any })}
            onDelete={activeModal === 'education' ? id => handleDelete(id) : undefined}
          />
        )}
        {modal(
          activeModal === 'certifications' || activeModal === 'add-certifications',
          activeModal === 'add-certifications' ? 'Add Certification' : 'Edit Certification',
          <EditCertificationSection
            certifications={draft.certifications as any}
            onChange={c => updateDraft({ certifications: c as any })}
            onDelete={activeModal === 'certifications' ? id => handleDelete(id) : undefined}
          />
        )}

        <ResumeUploadModal
          isOpen={activeModal === 'resume-upload'}
          onClose={closeModal}
          onUpload={(file, onProgress) => uploadResumeMutation.mutateAsync({ file, onProgress }).then(() => {})}
          isUploading={uploadResumeMutation.isPending}
          currentResume={profile?.resume}
        />
        <ProfilePhotoUploadModal
          isOpen={activeModal === 'profile-photo-upload'}
          onClose={closeModal}
          onUpload={(file, onProgress) => uploadProfilePhotoMutation.mutateAsync({ file, onProgress }).then(() => {})}
          isUploading={uploadProfilePhotoMutation.isPending}
        />
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
