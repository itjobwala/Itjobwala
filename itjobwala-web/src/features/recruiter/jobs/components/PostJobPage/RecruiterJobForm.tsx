'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { PRIMARY } from '@/src/lib/constants';
import { RecruiterShell } from '@/layout/shell';
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
      <div className="max-w-[680px] mx-auto px-5 py-10 sm:py-14">
        <div className="mb-8">
          <button type="button" onClick={() => router.back()}
            className="flex items-center gap-1.5 text-[13px] font-semibold text-gray-500 hover:text-gray-800 transition-colors mb-4">
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Back
          </button>
          <h1 className="font-extrabold text-[#0f172a] text-2xl sm:text-[28px] mb-1" style={{ letterSpacing: -0.8 }}>
            Post a new job
          </h1>
          <p className="text-sm text-gray-500">Fill in the details below. You can edit the job after posting.</p>
        </div>

        <form onSubmit={handleSubmit}
          className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 flex flex-col gap-5"
          style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
          <JobFieldsBasic form={form} errors={errors} setField={set} />
          <JobFieldsDetail
            form={form} errors={errors} setField={set}
            skillInput={skillInput} setSkillInput={setSkillInput}
            skillError={skillError} setSkillError={setSkillError}
            skillSuggestions={skillSuggestions}
            addSkill={addSkill} removeSkill={removeSkill}
          />

          {error && (
            <div className="rounded-xl px-4 py-3 text-sm font-medium text-red-600 bg-red-50 border border-red-200">
              {error}
            </div>
          )}

          <div>
            <button type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 text-white font-bold text-[15px] rounded-xl py-3.5 transition-all"
              style={{ background: loading ? '#93aef5' : PRIMARY, cursor: loading ? 'not-allowed' : 'pointer' }}>
              {loading
                ? <><div className="w-4 h-4 border-[2.5px] border-white/40 border-t-white rounded-full animate-spin" /> Saving…</>
                : 'Save as Draft →'
              }
            </button>
            <p className="text-center text-[12px] text-gray-400 mt-2">
              Saved as draft — you can review and publish from the next screen.
            </p>
          </div>
        </form>
      </div>
    </RecruiterShell>
  );
}
