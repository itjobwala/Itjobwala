'use client';

import { useState, useEffect, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import {
  useRecruiterPostedJobDetailQuery,
  useUpdateRecruiterJobMutation,
} from '@/features/recruiter/hooks';

import Button from '@/src/components/ui/Button';
import { validateSkill } from '@/src/lib/skillValidation';
import { useSkillSuggestions } from '@/src/hooks/useSkillSuggestions';
import { validateSkillsRemote } from '@/features/jobs/shared';
import {
  type JobForm,
  type JobErrors,
  DEFAULT_JOB_FORM,
  parseBullets,
} from '../schemas/postJob.schema';
import JobFieldsBasic from './PostJobPage/JobFieldsBasic';
import JobFieldsDetail from './PostJobPage/JobFieldsDetail';

interface Props {
  jobId: string;
}

export default function RecruiterEditJobPage({ jobId }: Props) {
  const router = useRouter();
  const { data: job, isLoading: loadingJob } = useRecruiterPostedJobDetailQuery(jobId, true);
  const updateMutation = useUpdateRecruiterJobMutation();

  const [ready, setReady] = useState(false);
  const [skillInput, setSkillInput] = useState('');
  const [skillError, setSkillError] = useState('');
  const [apiError, setApiError] = useState('');
  const [errors, setErrors] = useState<JobErrors>({});
  const [form, setFormState] = useState<JobForm>(DEFAULT_JOB_FORM);
  const skillSuggestions = useSkillSuggestions(skillInput, form.requiredSkills);

  // Prefill once job loads
  useEffect(() => {
    if (!job || ready) return;
    setFormState({
      title: job.title ?? '',
      description: job.description ?? '',
      location: job.location ?? '',
      jobType: job.jobType ?? 'Full-time',
      workMode: job.workMode ?? 'On-site',
      salaryMinLpa: job.salaryMin != null ? Math.max(1, Math.round(job.salaryMin / 100000)) : 5,
      salaryMaxLpa: job.salaryMax != null ? Math.round(job.salaryMax / 100000) : 20,
      requiredSkills: job.requiredSkills ?? [],
      experienceMin: Math.min(20, parseInt(job.experienceLevel ?? '0') || 0),
      experienceMax: Math.min(20, parseInt((job.experienceLevel ?? '').split('-')[1] ?? '5') || 5),
      jobLevel: job.jobLevel ?? '',
      vacancies: job.vacancies != null ? String(job.vacancies) : '',
      closesAt: job.closesAt ? job.closesAt.substring(0, 10) : '',
      responsibilities: (job.responsibilities ?? []).join('\n'),
      requirements: (job.requirements ?? []).join('\n'),
      niceToHave: (job.niceToHave ?? []).join('\n'),
      benefits: (job.benefits ?? []).join('\n'),
    });
    setReady(true);
  }, [job, ready]);

  function set(k: keyof JobForm, v: any) {
    setFormState(f => ({ ...f, [k]: v }));
    setErrors(e => ({ ...e, [k]: '' }));
    setApiError('');
  }

  async function addSkill(override?: string, fromSuggestion = false) {
    const s = (override ?? skillInput).trim();
    if (!s) return;
    const error = validateSkill(s);
    if (error) { setSkillError(error); return; }
    if (form.requiredSkills.includes(s)) { setSkillError('Skill already added'); return; }
    if (!fromSuggestion) {
      try {
        const result = await validateSkillsRemote([s]);
        if (!result.valid) {
          setSkillError('Not a recognised skill — please select from suggestions');
          return;
        }
      } catch { /* network error — allow through */ }
    }
    set('requiredSkills', [...form.requiredSkills, s]);
    setSkillInput('');
    setSkillError('');
  }

  function removeSkill(skill: string) {
    set('requiredSkills', form.requiredSkills.filter(s => s !== skill));
  }

  function validate(isActiveLocked: boolean): JobErrors {
    const e: JobErrors = {};
    // Skip locked-field validation when the job is active with applications
    if (!isActiveLocked) {
      if (!form.title.trim() || form.title.trim().length < 5) e.title = 'Title must be at least 5 characters';
      if (form.title.trim().length > 150) e.title = 'Title must be at most 150 characters';
      if (!form.description.trim() || form.description.trim().length < 50) e.description = 'Description must be at least 50 characters';
      if (!form.location.trim()) e.location = 'Location is required';
      if (!form.responsibilities.trim()) e.responsibilities = 'At least one responsibility is required';
      if (!form.requirements.trim()) e.requirements = 'At least one requirement is required';
    }
    if (form.vacancies && Number(form.vacancies) < 1) e.vacancies = 'Vacancies must be at least 1';
    if (form.closesAt) {
      const closes = new Date(form.closesAt);
      if (closes <= new Date()) e.closesAt = 'Deadline must be a future date';
    }
    return e;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const isActiveLocked = job?.status === 'active' && (job?.applicationCount ?? 0) > 0;
    const errs = validate(isActiveLocked);
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setApiError('');
    try {
      const payload: Parameters<typeof updateMutation.mutateAsync>[0]['data'] = {
        salaryMin: form.salaryMinLpa * 100000,
        salaryMax: form.salaryMaxLpa * 100000,
        requiredSkills: form.requiredSkills,
        experienceMin: form.experienceMin,
        experienceMax: form.experienceMax,
        jobLevel: form.jobLevel || null,
        vacancies: form.vacancies ? Number(form.vacancies) : undefined,
        // Always send closesAt so null clears an existing deadline
        closesAt: form.closesAt || null,
        niceToHave: parseBullets(form.niceToHave),
        benefits: parseBullets(form.benefits),
      };

      // Only include locked fields when the job is NOT active+with-applications
      if (!isActiveLocked) {
        payload.title = form.title.trim();
        payload.description = form.description.trim();
        payload.location = form.location.trim();
        payload.jobType = form.jobType;
        payload.workMode = form.workMode;
        payload.responsibilities = parseBullets(form.responsibilities);
        payload.requirements = parseBullets(form.requirements);
      }

      await updateMutation.mutateAsync({ jobId, data: payload });
      router.push(`/recruiter/posted-jobs/${jobId}`);
    } catch (err: any) {
      const msg = err?.response?.data?.message || (err instanceof Error ? err.message : 'Failed to update job');
      // Surface field-level validation errors from backend
      const fieldErrors = err?.response?.data?.details;
      if (fieldErrors && typeof fieldErrors === 'object') {
        setErrors(fieldErrors);
      } else {
        setApiError(msg);
      }
    }
  }

  const isActive = job?.status === 'active' && (job?.applicationCount ?? 0) > 0;

  if (loadingJob || !ready) {
    return (
      <div className="px-5 py-20 text-center">
        <div className="w-8 h-8 border-4 border-token border-t-primary rounded-full animate-spin mx-auto" />
        <p className="mt-4 text-muted">Loading job details…</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col min-h-full bg-surface">
      {/* Header */}
      <div className="px-6 sm:px-10 pt-8 pb-6 border-b border-token">
        <button type="button" onClick={() => router.back()}
          className="flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-body transition-colors mb-4">
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Back
        </button>
        <h1 className="text-h1 text-heading mb-1" style={{ letterSpacing: -0.8 }}>
          Edit Job
        </h1>
        <p className="text-small-text text-muted">
          {isActive
            ? 'This job is active with applications — only salary, skills, deadline, and optional fields can be changed.'
            : 'Update the job details below.'}
        </p>
      </div>

      {isActive && (
        <div className="mx-6 sm:mx-10 mt-6 flex gap-3 items-start rounded-xl bg-amber-50 border border-amber-200 px-4 py-3">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2.2" className="shrink-0 mt-0.5">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          <p className="text-sm text-amber-800 font-medium">
            Title, description, location, job type, and work mode are locked while the job is active and has applications.
            Close the job first to edit them.
          </p>
        </div>
      )}

      {/* Body */}
      <div className="flex-1 px-6 sm:px-10 py-8 flex flex-col gap-8">
        <section>
          <p className="text-caption font-bold text-subtle uppercase tracking-wider mb-5">Job details</p>
          <div className="flex flex-col gap-5">
            <JobFieldsBasic form={form} errors={errors} setField={set} disabled={isActive} />
          </div>
        </section>

        <div className="border-t border-token" />

        <section>
          <p className="text-caption font-bold text-subtle uppercase tracking-wider mb-5">Additional details</p>
          <div className="flex flex-col gap-5">
            <JobFieldsDetail
              form={form} errors={errors} setField={set}
              skillInput={skillInput} setSkillInput={setSkillInput}
              skillError={skillError} setSkillError={setSkillError}
              skillSuggestions={skillSuggestions}
              addSkill={addSkill} removeSkill={removeSkill}
            />
          </div>
        </section>

        {apiError && (
          <div className="rounded-xl px-4 py-3 text-sm font-medium text-danger bg-danger-bg border border-danger">{apiError}</div>
        )}
      </div>

      {/* Footer action bar */}
      <div className="sticky bottom-0 bg-surface border-t border-token px-6 sm:px-10 py-4 flex items-center justify-between gap-4 flex-wrap">
        <p className="text-caption text-subtle">
          Changes are saved immediately when you click Save changes.
        </p>
        <div className="flex items-center gap-3 shrink-0">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={updateMutation.isPending}>
            Save changes
          </Button>
        </div>
      </div>
    </form>
  );
}
