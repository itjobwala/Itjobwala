'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { RecruiterShell } from '@/layout/shell';
import Button from '@/src/components/ui/Button';
import { useSkillSuggestions } from '@/src/hooks/useSkillSuggestions';
import { validateSkill } from '@/src/lib/skillValidation';
import { validateSkillsRemote } from '@/features/jobs/shared';
import { createRecruiterJob } from '@/features/recruiter/jobs/services/recruiterJobs.api';
import {
  type JobForm,
  type JobErrors,
  DEFAULT_JOB_FORM,
  validateJobAll,
  parseBullets,
} from '../../schemas/postJob.schema';
import JobFieldsBasic from './JobFieldsBasic';
import JobFieldsDetail from './JobFieldsDetail';

function scrollToFirstError() {
  requestAnimationFrame(() => {
    const firstErr = document.querySelector<HTMLElement>('p.text-danger:not(:empty)');
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

export default function RecruiterJobForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [skillInput, setSkillInput] = useState('');
  const [skillError, setSkillError] = useState('');
  const [form, setForm] = useState<JobForm>(DEFAULT_JOB_FORM);
  const [errors, setErrors] = useState<JobErrors>({});
  const skillSuggestions = useSkillSuggestions(skillInput, form.requiredSkills);

  function set(k: keyof JobForm, v: any) {
    setForm(f => ({ ...f, [k]: v }));
    setErrors(e => ({ ...e, [k]: '' }));
    setError('');
  }

  async function addSkill(override?: string, fromSuggestion = false) {
    const s = (override ?? skillInput).trim();
    if (!s) return;
    const err = validateSkill(s);
    if (err) { setSkillError(err); return; }
    if (form.requiredSkills.includes(s)) { setSkillError('Skill already added'); return; }
    if (!fromSuggestion) {
      try {
        const result = await validateSkillsRemote([s]);
        if (!result.valid) { setSkillError('Not a recognised skill — please select from suggestions'); return; }
      } catch { /* network error — allow through */ }
    }
    set('requiredSkills', [...form.requiredSkills, s]);
    setSkillInput('');
    setSkillError('');
  }

  function removeSkill(skill: string) {
    set('requiredSkills', form.requiredSkills.filter(s => s !== skill));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const errs = validateJobAll(form);
    if (Object.keys(errs).length) { setErrors(errs); scrollToFirstError(); return; }
    setLoading(true);
    setError('');
    try {
      const job = await createRecruiterJob({
        title: form.title.trim(),
        description: form.description.trim(),
        location: form.location.trim(),
        jobType: form.jobType,
        workMode: form.workMode,
        salaryMin: form.salaryMinLpa * 100000,
        salaryMax: form.salaryMaxLpa * 100000,
        requiredSkills: form.requiredSkills,
        experienceMin: form.experienceMin,
        experienceMax: form.experienceMax,
        jobLevel: form.jobLevel || undefined,
        vacancies: form.vacancies ? Number(form.vacancies) : undefined,
        closesAt: form.closesAt || undefined,
        responsibilities: parseBullets(form.responsibilities),
        requirements: parseBullets(form.requirements),
        niceToHave: parseBullets(form.niceToHave),
        benefits: parseBullets(form.benefits),
      });
      router.push(`/recruiter/posted-jobs/${job.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to post job. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <RecruiterShell>
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
          <h3 className="text-h3 text-heading mb-1" style={{ letterSpacing: -0.8 }}>
            Post a new job
          </h3>
          <p className="text-small-text text-muted">Fill in the details below. You can edit the job after posting.</p>
        </div>

        {/* Body */}
        <div className="flex-1 px-6 sm:px-10 py-8 flex flex-col gap-8">
          <section>
            <p className="text-caption font-bold text-subtle uppercase tracking-wider mb-5">Job details</p>
            <div className="flex flex-col gap-5">
              <JobFieldsBasic form={form} errors={errors} setField={set} />
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

          {error && (
            <div className="rounded-xl px-4 py-3 text-sm font-medium text-danger bg-danger-bg border border-danger">
              {error}
            </div>
          )}
        </div>

        {/* Footer action bar */}
        <div className="sticky bottom-0 bg-surface border-t border-token px-6 sm:px-10 py-4 flex items-center justify-between gap-4 flex-wrap">
          <p className="text-caption text-subtle">
            Saved as draft — you can review and publish from the next screen.
          </p>
          <div className="flex items-center gap-3 shrink-0">
            <Button type="button" variant="outline" size="sm" onClick={() => router.back()}>
              Close
            </Button>
            <Button type="submit" variant="primary" size="sm" loading={loading}>
              Save as Draft →
            </Button>
          </div>
        </div>
      </form>
    </RecruiterShell>
  );
}
