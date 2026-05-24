'use client';

import { useState, type FormEvent } from 'react';
import { useSkillSuggestions } from '@/src/hooks/useSkillSuggestions';
import { validateSkill } from '@/src/lib/skillValidation';
import { validateSkillsRemote } from '@/features/jobs/shared';
import { signupRecruiter } from '@/features/auth/services/recruiter.api';
import { createRecruiterJob } from '@/features/recruiter/jobs/services/recruiterJobs.api';
import {
  type AccountForm,
  type AccountErrors,
  type JobForm,
  type JobErrors,
  DEFAULT_JOB_FORM,
  validateAccount,
  validateJobBasic,
  validateJobDetail,
  parseBullets,
} from '../schemas/postJob.schema';

function scrollToFirstError() {
  requestAnimationFrame(() => {
    const firstErr = document.querySelector<HTMLElement>('p.text-red-500:not(:empty)');
    if (!firstErr) return;
    const container = firstErr.closest<HTMLElement>('div');
    const input = container?.querySelector<HTMLElement>(
      'input:not([type=hidden]):not([type=range]):not([type=checkbox]), textarea, select'
    );
    if (input) {
      input.scrollIntoView({ behavior: 'smooth', block: 'center' });
      input.focus({ preventScroll: true });
    } else {
      firstErr.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  });
}

export function usePostJobWizard() {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [postedJobId, setPostedJobId] = useState('');

  const [account, setAccount] = useState<AccountForm>({
    fullName: '', companyName: '', email: '', password: '', terms: false,
  });
  const [accountErrors, setAccountErrors] = useState<AccountErrors>({});

  const [job, setJob] = useState<JobForm>(DEFAULT_JOB_FORM);
  const [jobErrors, setJobErrors] = useState<JobErrors>({});
  const [skillInput, setSkillInput] = useState('');
  const [skillError, setSkillError] = useState('');
  const skillSuggestions = useSkillSuggestions(skillInput, job.requiredSkills);

  function setAccountField<K extends keyof AccountForm>(k: K, v: AccountForm[K]) {
    setAccount(f => ({ ...f, [k]: v }));
    setAccountErrors(e => ({ ...e, [k]: undefined }));
    setApiError('');
  }

  function handleAccountContinue(e: FormEvent) {
    e.preventDefault();
    const errs = validateAccount(account);
    if (Object.keys(errs).length) { setAccountErrors(errs); scrollToFirstError(); return; }
    setStep(1);
    window.scrollTo(0, 0);
  }

  function setJobField(k: keyof JobForm, v: any) {
    setJob(f => ({ ...f, [k]: v }));
    setJobErrors(e => ({ ...e, [k]: undefined }));
    setApiError('');
  }

  async function addSkill(override?: string, fromSuggestion = false) {
    const s = (override ?? skillInput).trim();
    if (!s) return;
    const err = validateSkill(s);
    if (err) { setSkillError(err); return; }
    if (job.requiredSkills.includes(s)) { setSkillError('Skill already added'); return; }
    if (!fromSuggestion) {
      try {
        const result = await validateSkillsRemote([s]);
        if (!result.valid) { setSkillError('Not a recognised skill — please select from suggestions'); return; }
      } catch { /* network error — allow through */ }
    }
    setJobField('requiredSkills', [...job.requiredSkills, s]);
    setSkillInput('');
    setSkillError('');
  }

  function removeSkill(skill: string) {
    setJobField('requiredSkills', job.requiredSkills.filter(s => s !== skill));
  }

  function handleJobBasicContinue(e: FormEvent) {
    e.preventDefault();
    const errs = validateJobBasic(job);
    if (Object.keys(errs).length) { setJobErrors(errs); scrollToFirstError(); return; }
    setJobErrors({});
    setStep(2);
    window.scrollTo(0, 0);
  }

  async function handleJobSubmit(e: FormEvent) {
    e.preventDefault();
    const errs = validateJobDetail(job);
    if (Object.keys(errs).length) { setJobErrors(errs); scrollToFirstError(); return; }

    setLoading(true);
    setApiError('');
    try {
      await signupRecruiter({
        full_name: account.fullName.trim(),
        company_name: account.companyName.trim(),
        email: account.email.trim(),
        password: account.password,
        terms_accepted: account.terms,
      });

      const posted = await createRecruiterJob({
        title: job.title.trim(),
        description: job.description.trim(),
        location: job.location.trim(),
        jobType: job.jobType,
        workMode: job.workMode,
        salaryMin: job.salaryMinLpa * 100000,
        salaryMax: job.salaryMaxLpa * 100000,
        requiredSkills: job.requiredSkills,
        experienceMin: job.experienceMin,
        experienceMax: job.experienceMax,
        jobLevel: job.jobLevel || undefined,
        vacancies: job.vacancies ? Number(job.vacancies) : undefined,
        closesAt: job.closesAt || undefined,
        responsibilities: parseBullets(job.responsibilities),
        requirements: parseBullets(job.requirements),
        niceToHave: parseBullets(job.niceToHave),
        benefits: parseBullets(job.benefits),
      });

      setPostedJobId(posted.id);
    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return {
    step, setStep,
    account, accountErrors, setAccountField, handleAccountContinue,
    job, jobErrors, setJobField,
    skillInput, setSkillInput, skillError, setSkillError, skillSuggestions,
    addSkill, removeSkill,
    handleJobBasicContinue, handleJobSubmit,
    loading, apiError, setApiError, postedJobId,
  };
}
