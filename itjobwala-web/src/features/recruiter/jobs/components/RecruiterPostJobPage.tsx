'use client';

import { useEffect, useState } from 'react';
import { safeLocalStorageGetItem } from '@/src/lib/hydration-safe';
import { decodeJwtPayload } from '@/src/lib/auth';
import { usePostJobWizard } from '../hooks/usePostJobWizard';
import RecruiterJobForm from './PostJobPage/RecruiterJobForm';
import PostJobLeftPanel from './PostJobPage/PostJobLeftPanel';
import PostJobNavbar from './PostJobPage/PostJobNavbar';
import PostJobStepBar from './PostJobPage/PostJobStepBar';
import PostJobSuccessScreen from './PostJobPage/PostJobSuccessScreen';
import AccountStep from './PostJobPage/steps/AccountStep';
import JobBasicsStep from './PostJobPage/steps/JobBasicsStep';
import JobDetailsStep from './PostJobPage/steps/JobDetailsStep';

export default function RecruiterPostJobPage() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    const token = safeLocalStorageGetItem('recruiter_token');
    const payload = token ? decodeJwtPayload(token) : null;
    const valid = Boolean(
      token && payload &&
      payload.role?.toLowerCase() === 'recruiter' &&
      !(payload.exp && Date.now() / 1000 >= payload.exp)
    );
    setIsLoggedIn(valid);
  }, []);

  const wizard = usePostJobWizard();

  if (isLoggedIn === null) return null;
  if (isLoggedIn) return <RecruiterJobForm />;
  if (wizard.postedJobId) return <PostJobSuccessScreen jobId={wizard.postedJobId} />;

  const STEP_TITLES = [
    { heading: 'Create your free account', sub: 'Step 1 of 3 — Account details' },
    { heading: 'Job basics',               sub: 'Step 2 of 3 — Basic job info' },
    { heading: 'Job details',              sub: 'Step 3 of 3 — Skills & description' },
  ];
  const { heading, sub } = STEP_TITLES[wizard.step];

  return (
    <div className="min-h-screen flex flex-col" style={{ fontFamily: 'var(--font-plus-jakarta)', background: '#f8faff' }}>
      <PostJobNavbar />

      <div className="flex-1 flex">
        <PostJobLeftPanel />

        <div className="flex-1 flex items-start justify-center overflow-y-auto px-5 py-10 sm:px-10 sm:py-12 lg:px-14 lg:py-14">
          <div className="w-full max-w-[520px]">
            <div className="mb-2">
              <h1 className="font-extrabold text-heading mb-1 text-2xl sm:text-4xl" style={{ letterSpacing: -0.8 }}>
                {heading}
              </h1>
              <p className="text-sm text-muted">{sub}</p>
            </div>

            <div className="my-6">
              <PostJobStepBar current={wizard.step} />
            </div>

            {wizard.step === 0 && (
              <AccountStep
                account={wizard.account}
                errors={wizard.accountErrors}
                setField={wizard.setAccountField}
                onSubmit={wizard.handleAccountContinue}
              />
            )}

            {wizard.step === 1 && (
              <JobBasicsStep
                form={wizard.job}
                errors={wizard.jobErrors}
                setField={wizard.setJobField}
                onBack={() => { wizard.setStep(0); wizard.setApiError(''); }}
                onSubmit={wizard.handleJobBasicContinue}
              />
            )}

            {wizard.step === 2 && (
              <JobDetailsStep
                form={wizard.job}
                errors={wizard.jobErrors}
                setField={wizard.setJobField}
                skillInput={wizard.skillInput}
                setSkillInput={wizard.setSkillInput}
                skillError={wizard.skillError}
                setSkillError={wizard.setSkillError}
                skillSuggestions={wizard.skillSuggestions}
                addSkill={wizard.addSkill}
                removeSkill={wizard.removeSkill}
                loading={wizard.loading}
                apiError={wizard.apiError}
                onBack={() => { wizard.setStep(1); wizard.setApiError(''); }}
                onSubmit={wizard.handleJobSubmit}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
