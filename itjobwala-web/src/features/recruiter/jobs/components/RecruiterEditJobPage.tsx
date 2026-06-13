'use client';

import { useState, useEffect, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import {
  useRecruiterPostedJobDetailQuery,
  useUpdateRecruiterJobMutation,
} from '@/features/recruiter/hooks';

import SalaryRangeSlider from '@/src/components/ui/SalaryRangeSlider';
import Button from '@/src/components/ui/Button';
import { validateSkill } from '@/src/lib/skillValidation';
import { useSkillSuggestions } from '@/src/hooks/useSkillSuggestions';
import { validateSkillsRemote } from '@/features/jobs/shared';

const PRIMARY = '#1557FF';

const JOB_TYPES = ['Full-time', 'Part-time', 'Contract', 'Internship', 'Freelance'];
const WORK_MODES = ['Remote', 'On-site', 'Hybrid'];
const JOB_LEVELS = ['Junior', 'Mid', 'Senior', 'Lead', 'Manager'];

function ExperienceSlider({ minVal, maxVal, onChange }: {
  minVal: number; maxVal: number;
  onChange: (min: number, max: number) => void;
}) {
  const minPct = (minVal / 20) * 100;
  const maxPct = (maxVal / 20) * 100;
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <label className="text-sm font-bold text-body-secondary">Experience required</label>
        <span className="text-sm font-bold" style={{ color: PRIMARY }}>
          {minVal === 0 ? 'Any' : `${minVal} yrs`} – {maxVal === 20 ? '20+ yrs' : `${maxVal} yrs`}
        </span>
      </div>
      <div className="relative h-5 flex items-center">
        <div className="absolute inset-x-0 h-1.5 rounded-full bg-surface-mid pointer-events-none" />
        <div className="absolute h-1.5 rounded-full pointer-events-none"
          style={{ left: `${minPct}%`, right: `${100 - maxPct}%`, background: PRIMARY }} />
        <input type="range" min={0} max={20} step={1} value={minVal}
          onChange={e => onChange(Math.min(+e.target.value, maxVal - 1), maxVal)}
          className="salary-thumb absolute w-full"
          style={{ zIndex: minVal >= maxVal - 1 ? 5 : 3 }} />
        <input type="range" min={0} max={20} step={1} value={maxVal}
          onChange={e => onChange(minVal, Math.max(+e.target.value, minVal + 1))}
          className="salary-thumb absolute w-full" style={{ zIndex: 4 }} />
      </div>
      <div className="flex justify-between mt-2 text-micro text-subtle select-none">
        <span>0</span><span>5 yrs</span><span>10 yrs</span><span>15 yrs</span><span>20 yrs</span>
      </div>
    </div>
  );
}

function parseBullets(text: string): string[] {
  return text.split('\n').map(l => l.trim()).filter(Boolean);
}


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
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [form, setFormState] = useState({
    title: '',
    description: '',
    location: '',
    jobType: 'Full-time',
    workMode: 'On-site',
    salaryMinLpa: 5,
    salaryMaxLpa: 20,
    requiredSkills: [] as string[],
    experienceMin: 0,
    experienceMax: 5,
    jobLevel: '',
    vacancies: '',
    closesAt: '',
    responsibilities: '',
    requirements: '',
    niceToHave: '',
    benefits: '',
  });
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

  function set(k: string, v: any) {
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

  function validate(isActiveLocked: boolean): Record<string, string> {
    const e: Record<string, string> = {};
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
      <div className="max-w-[680px] mx-auto px-5 py-20 text-center">
        <div className="w-8 h-8 border-4 border-token border-t-primary rounded-full animate-spin mx-auto" />
        <p className="mt-4 text-muted">Loading job details…</p>
      </div>
    );
  }

  return (
    <div className="max-w-[680px] mx-auto px-5 py-10">
      {/* Header */}
      <div className="mb-8">
        <button type="button" onClick={() => router.back()}
          className="flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-body transition-colors mb-4">
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Back
        </button>
        <h1 className="font-extrabold text-heading text-2xl sm:text-4xl mb-1" style={{ letterSpacing: -0.8 }}>
          Edit Job
        </h1>
        <p className="text-sm text-muted">
          {isActive
            ? 'This job is active with applications — only salary, skills, deadline, and optional fields can be changed.'
            : 'Update the job details below.'}
        </p>
      </div>

      {isActive && (
        <div className="mb-6 flex gap-3 items-start rounded-xl bg-amber-50 border border-amber-200 px-4 py-3">
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

      <form onSubmit={handleSubmit} className="bg-surface rounded-2xl border border-token p-6 sm:p-8 flex flex-col gap-5" style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>

        {/* Title */}
        <div>
          <label className="block text-sm font-bold text-body-secondary mb-1.5">
            Job title <span style={{ color: PRIMARY }}>*</span>
          </label>
          <input
            value={form.title}
            onChange={e => set('title', e.target.value)}
            disabled={isActive}
            placeholder="e.g. Senior React Developer"
            className="w-full rounded-xl border px-3.5 py-2.5 text-sm font-medium text-heading outline-none transition-colors placeholder:text-subtle disabled:bg-surface-alt disabled:text-subtle disabled:cursor-not-allowed"
            style={{ borderColor: errors.title ? 'var(--color-danger)' : 'var(--color-border)' }}
          />
          {errors.title && <p className="text-xs text-danger mt-1">{errors.title}</p>}
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-bold text-body-secondary mb-1.5">
            Job description <span style={{ color: PRIMARY }}>*</span>
          </label>
          <textarea
            value={form.description}
            onChange={e => set('description', e.target.value)}
            disabled={isActive}
            rows={6}
            placeholder="Describe the role (min. 50 characters)..."
            className="w-full rounded-xl border px-3.5 py-2.5 text-sm font-medium text-heading outline-none transition-colors placeholder:text-subtle resize-none disabled:bg-surface-alt disabled:text-subtle disabled:cursor-not-allowed"
            style={{ borderColor: errors.description ? 'var(--color-danger)' : 'var(--color-border)' }}
          />
          <div className="flex items-center justify-between mt-1">
            {errors.description ? <p className="text-xs text-danger">{errors.description}</p> : <span />}
            <span className="text-micro text-subtle">{form.description.length} chars</span>
          </div>
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-bold text-body-secondary mb-1.5">
            Location <span style={{ color: PRIMARY }}>*</span>
          </label>
          <input
            value={form.location}
            onChange={e => set('location', e.target.value)}
            disabled={isActive}
            placeholder="e.g. Bengaluru / Remote"
            className="w-full rounded-xl border px-3.5 py-2.5 text-sm font-medium text-heading outline-none disabled:bg-surface-alt disabled:text-subtle disabled:cursor-not-allowed"
            style={{ borderColor: errors.location ? 'var(--color-danger)' : 'var(--color-border)' }}
          />
          {errors.location && <p className="text-xs text-danger mt-1">{errors.location}</p>}
        </div>

        {/* Experience slider */}
        <ExperienceSlider
          minVal={form.experienceMin} maxVal={form.experienceMax}
          onChange={(min, max) => { set('experienceMin', min); set('experienceMax', max); }}
        />

        {/* Job type + Work mode */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-body-secondary mb-1.5">Job type</label>
            <select
              value={form.jobType}
              onChange={e => set('jobType', e.target.value)}
              disabled={isActive}
              className="w-full rounded-xl border border-token px-3.5 py-2.5 text-sm font-medium text-heading outline-none bg-surface disabled:bg-surface-alt disabled:text-subtle disabled:cursor-not-allowed"
            >
              {JOB_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-body-secondary mb-1.5">Work mode</label>
            <select
              value={form.workMode}
              onChange={e => set('workMode', e.target.value)}
              disabled={isActive}
              className="w-full rounded-xl border border-token px-3.5 py-2.5 text-sm font-medium text-heading outline-none bg-surface disabled:bg-surface-alt disabled:text-subtle disabled:cursor-not-allowed"
            >
              {WORK_MODES.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
        </div>

        {/* Salary */}
        <SalaryRangeSlider
          minLpa={form.salaryMinLpa}
          maxLpa={form.salaryMaxLpa}
          minAllowed={1}
          onChange={(min, max) => { set('salaryMinLpa', min); set('salaryMaxLpa', max); }}
        />

        {/* Level + Vacancies + Deadline */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-bold text-body-secondary mb-1.5">Job level</label>
            <select
              value={form.jobLevel}
              onChange={e => set('jobLevel', e.target.value)}
              className="w-full rounded-xl border border-token px-3.5 py-2.5 text-sm font-medium text-heading outline-none bg-surface"
            >
              <option value="">Select level</option>
              {JOB_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-body-secondary mb-1.5">Vacancies</label>
            <input
              type="number"
              min="1"
              value={form.vacancies}
              onChange={e => set('vacancies', e.target.value)}
              placeholder="e.g. 2"
              className="w-full rounded-xl border px-3.5 py-2.5 text-sm font-medium text-heading outline-none"
              style={{ borderColor: errors.vacancies ? 'var(--color-danger)' : 'var(--color-border)' }}
            />
            {errors.vacancies && <p className="text-xs text-danger mt-1">{errors.vacancies}</p>}
          </div>
          <div>
            <label className="block text-sm font-bold text-body-secondary mb-1.5">Application deadline</label>
            <input
              type="date"
              value={form.closesAt}
              onChange={e => set('closesAt', e.target.value)}
              className="w-full rounded-xl border px-3.5 py-2.5 text-sm font-medium text-heading outline-none"
              style={{ borderColor: errors.closesAt ? 'var(--color-danger)' : 'var(--color-border)' }}
            />
            {errors.closesAt && <p className="text-xs text-danger mt-1">{errors.closesAt}</p>}
          </div>
        </div>

        {/* Skills */}
        <div>
          <label className="block text-sm font-bold text-body-secondary mb-1.5">Required skills</label>
          <div className="flex gap-2 mb-2">
            <input
              value={skillInput}
              onChange={e => { setSkillInput(e.target.value); setSkillError(''); }}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } }}
              placeholder="Type to search skills (e.g. React, Node.js)"
              className="flex-1 rounded-xl border px-3.5 py-2.5 text-sm font-medium text-heading outline-none"
              style={{ borderColor: skillError ? 'var(--color-danger)' : 'var(--color-border)' }}
            />
            <button type="button" onClick={() => addSkill()}
              className="px-4 py-2.5 rounded-xl text-sm font-bold text-white shrink-0"
              style={{ background: PRIMARY }}>
              Add
            </button>
          </div>
          {skillError && <p className="text-xs text-danger mb-2">{skillError}</p>}
          {skillSuggestions.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {skillSuggestions.map(s => (
                <button key={s} type="button"
                  onClick={() => addSkill(s, true)}
                  className="px-2.5 py-1 rounded-lg text-caption font-semibold bg-surface-hover text-muted hover:bg-primary/10 hover:text-primary transition-colors">
                  + {s}
                </button>
              ))}
            </div>
          )}
          {form.requiredSkills.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {form.requiredSkills.map(s => (
                <span key={s}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-full text-caption font-semibold"
                  style={{ background: `${PRIMARY}12`, color: PRIMARY, border: `1.5px solid ${PRIMARY}30` }}>
                  {s}
                  <button type="button" onClick={() => removeSkill(s)} className="hover:text-red-500 transition-colors">×</button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Responsibilities */}
        <div>
          <label className="block text-sm font-bold text-body-secondary mb-1.5">
            Responsibilities <span style={{ color: PRIMARY }}>*</span>
          </label>
          <textarea
            value={form.responsibilities}
            onChange={e => set('responsibilities', e.target.value)}
            rows={5}
            placeholder={"Build and maintain scalable APIs\nCollaborate with cross-functional teams"}
            className="w-full rounded-xl border px-3.5 py-2.5 text-sm font-medium text-heading outline-none placeholder:text-subtle resize-none"
            style={{ borderColor: errors.responsibilities ? 'var(--color-danger)' : 'var(--color-border)' }}
          />
          <p className="text-micro text-subtle mt-1">One item per line.</p>
          {errors.responsibilities && <p className="text-xs text-danger mt-1">{errors.responsibilities}</p>}
        </div>

        {/* Requirements */}
        <div>
          <label className="block text-sm font-bold text-body-secondary mb-1.5">
            Requirements <span style={{ color: PRIMARY }}>*</span>
          </label>
          <textarea
            value={form.requirements}
            onChange={e => set('requirements', e.target.value)}
            rows={5}
            placeholder={"3+ years of experience with React\nStrong understanding of REST APIs"}
            className="w-full rounded-xl border px-3.5 py-2.5 text-sm font-medium text-heading outline-none placeholder:text-subtle resize-none"
            style={{ borderColor: errors.requirements ? 'var(--color-danger)' : 'var(--color-border)' }}
          />
          <p className="text-micro text-subtle mt-1">One item per line.</p>
          {errors.requirements && <p className="text-xs text-danger mt-1">{errors.requirements}</p>}
        </div>

        {/* Nice to have */}
        <div>
          <label className="block text-sm font-bold text-body-secondary mb-1.5">
            Nice to have <span className="text-subtle font-normal text-micro">(optional)</span>
          </label>
          <textarea
            value={form.niceToHave}
            onChange={e => set('niceToHave', e.target.value)}
            rows={3}
            placeholder={"Experience with Docker/Kubernetes\nFamiliarity with GraphQL"}
            className="w-full rounded-xl border border-token px-3.5 py-2.5 text-sm font-medium text-heading outline-none placeholder:text-subtle resize-none"
          />
          <p className="text-micro text-subtle mt-1">One item per line.</p>
        </div>

        {/* Benefits */}
        <div>
          <label className="block text-sm font-bold text-body-secondary mb-1.5">
            Perks &amp; benefits <span className="text-subtle font-normal text-micro">(optional)</span>
          </label>
          <textarea
            value={form.benefits}
            onChange={e => set('benefits', e.target.value)}
            rows={3}
            placeholder={"Health insurance\nFlexible working hours"}
            className="w-full rounded-xl border border-token px-3.5 py-2.5 text-sm font-medium text-heading outline-none placeholder:text-subtle resize-none"
          />
          <p className="text-micro text-subtle mt-1">One item per line.</p>
        </div>

        {apiError && (
          <div className="rounded-xl px-4 py-3 text-sm font-medium text-danger bg-danger-bg border border-danger">{apiError}</div>
        )}

        <div className="flex gap-3 pt-2">
          <Button
            variant="secondary"
            size="lg"
            rounded="xl"
            type="button"
            onClick={() => router.back()}
            className="flex-1 py-3"
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            size="lg"
            rounded="xl"
            type="submit"
            loading={updateMutation.isPending}
            className="flex-[2] py-3 text-base"
          >
            Save changes
          </Button>
        </div>
      </form>
    </div>
  );
}
