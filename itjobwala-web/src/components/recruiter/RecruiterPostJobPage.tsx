'use client';

import { useState, useEffect, type FormEvent } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Field from '@/src/components/ui/Field';
import PasswordField from '@/src/components/ui/PasswordField';
import { PRIMARY } from '@/src/lib/constants';
import { signupRecruiter, createRecruiterJob } from '@/src/lib/api/recruiter';
import { safeLocalStorageGetItem } from '@/src/lib/hydration-safe';
import { decodeJwtPayload } from '@/src/lib/auth';
import RecruiterShell from '@/src/components/recruiter/RecruiterShell';
import SalaryRangeSlider from '@/src/components/ui/SalaryRangeSlider';
import { validateSkill } from '@/src/lib/skillValidation';
import { useSkillSuggestions } from '@/src/hooks/useSkillSuggestions';
import { validateSkillsRemote } from '@/src/lib/api/skills';

// ── Utility ───────────────────────────────────────────────────────────────────

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

// ── Constants ─────────────────────────────────────────────────────────────────

const STEPS = ['Your Account', 'Job Basics', 'Job Details'];

const JOB_TYPES = ['Full-time', 'Part-time', 'Contract', 'Internship', 'Freelance'];
const WORK_MODES = ['Remote', 'On-site', 'Hybrid'];
const JOB_LEVELS = ['Junior', 'Mid', 'Senior', 'Lead', 'Manager'];

const PERKS = [
  { icon: '⚡', title: 'Post in 2 minutes',       sub: 'Simple job posting, no bloated forms' },
  { icon: '🎯', title: 'Reach matched candidates', sub: 'Only relevant profiles, no mass spam' },
  { icon: '💬', title: 'Direct messaging',         sub: 'Chat with candidates without a recruiter' },
  { icon: '📊', title: 'Smart analytics',          sub: 'Track views, clicks and application rates' },
  { icon: '🔒', title: 'Verified profiles only',   sub: 'All candidates are identity-verified' },
];

// ── Types ─────────────────────────────────────────────────────────────────────

type AccountForm = {
  fullName: string; companyName: string;
  email: string; password: string; terms: boolean;
};
type AccountErrors = Partial<Record<keyof AccountForm, string>>;

type JobForm = {
  title: string; description: string; location: string;
  jobType: string; workMode: string;
  salaryMinLpa: number; salaryMaxLpa: number;
  requiredSkills: string[];
  experienceMin: number; experienceMax: number;
  jobLevel: string; vacancies: string; closesAt: string;
  responsibilities: string; requirements: string;
  niceToHave: string; benefits: string;
};
type JobErrors = Partial<Record<keyof JobForm, string>>;

// ── Shared sub-components ─────────────────────────────────────────────────────

function LeftPanel() {
  return (
    <div className="hidden lg:flex flex-col justify-between relative overflow-hidden shrink-0 w-[420px]"
      style={{ background: `linear-gradient(160deg, ${PRIMARY} 0%, #4338ca 100%)`, padding: '52px 44px' }}>
      <div className="absolute pointer-events-none" style={{ top: -60, right: -60, width: 220, height: 220, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
      <div className="absolute pointer-events-none" style={{ bottom: -80, left: -40, width: 260, height: 260, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />

      <div className="relative" style={{ zIndex: 1 }}>
        <div className="inline-flex items-center gap-2 rounded-full mb-8" style={{ background: 'rgba(255,255,255,0.12)', padding: '6px 14px', border: '1px solid rgba(255,255,255,0.18)' }}>
          <span className="inline-block rounded-full" style={{ width: 7, height: 7, background: '#4ade80' }} />
          <span className="text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.9)' }}>Free to post — no credit card needed</span>
        </div>

        <h2 className="font-extrabold text-white mb-4" style={{ fontSize: 34, lineHeight: 1.15, letterSpacing: -1.5 }}>
          Hire IT talent<br />the smart way.
        </h2>
        <p className="text-sm mb-10" style={{ color: 'rgba(255,255,255,0.65)', lineHeight: 1.8 }}>
          Post jobs and connect directly with skilled IT professionals — no middlemen, no noise.
        </p>

        <div>
          {PERKS.map(p => (
            <div key={p.title} className="flex gap-3.5 mb-5">
              <div className="shrink-0 flex items-center justify-center rounded-[10px]"
                style={{ width: 38, height: 38, background: 'rgba(255,255,255,0.12)', fontSize: 17 }}>
                {p.icon}
              </div>
              <div>
                <div className="text-sm font-bold text-white mb-0.5">{p.title}</div>
                <div className="text-xs" style={{ color: 'rgba(255,255,255,0.55)' }}>{p.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="relative flex gap-5 pt-6" style={{ zIndex: 1, borderTop: '1px solid rgba(255,255,255,0.12)' }}>
        {[{ v: '4,000+', l: 'Active IT candidates' }, { v: '500+', l: 'Companies hiring' }, { v: '92%', l: 'Response rate' }].map(s => (
          <div key={s.l}>
            <div className="font-extrabold text-white" style={{ fontSize: 20, letterSpacing: -0.5 }}>{s.v}</div>
            <div className="text-[11px] mt-0.5" style={{ color: 'rgba(255,255,255,0.5)' }}>{s.l}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StepBar({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-0 mb-8 justify-center">
      {STEPS.map((s, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <div key={i} className="flex items-center">
            <div className="flex flex-col items-center gap-1">
              <div className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300"
                style={{
                  background: done ? PRIMARY : active ? '#fff' : '#f3f4f6',
                  border: `2px solid ${done || active ? PRIMARY : '#e5e7eb'}`,
                  boxShadow: active ? `0 0 0 3px ${PRIMARY}18` : 'none',
                }}>
                {done
                  ? <svg width="13" height="13" fill="none" stroke="#fff" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" /></svg>
                  : <span className="text-xs font-bold" style={{ color: active ? PRIMARY : '#9ca3af' }}>{i + 1}</span>
                }
              </div>
              <span className="text-[11px] whitespace-nowrap" style={{ fontWeight: active ? 700 : 500, color: active ? PRIMARY : done ? '#374151' : '#9ca3af' }}>{s}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div className="h-[2px] mb-4 transition-colors duration-300" style={{ width: 48, background: i < current ? PRIMARY : '#e5e7eb', margin: '0 10px 16px' }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function ExperienceSlider({ minVal, maxVal, onChange }: {
  minVal: number; maxVal: number;
  onChange: (min: number, max: number) => void;
}) {
  const minPct = (minVal / 20) * 100;
  const maxPct = (maxVal / 20) * 100;
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <label className="text-[13px] font-bold text-gray-600">Experience required</label>
        <span className="text-[13px] font-bold" style={{ color: PRIMARY }}>
          {minVal === 0 ? 'Any' : `${minVal} yrs`} – {maxVal === 20 ? '20+ yrs' : `${maxVal} yrs`}
        </span>
      </div>
      <div className="relative h-5 flex items-center">
        <div className="absolute inset-x-0 h-1.5 rounded-full bg-gray-200 pointer-events-none" />
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
      <div className="flex justify-between mt-2 text-[11px] text-gray-400 select-none">
        <span>0</span><span>5 yrs</span><span>10 yrs</span><span>15 yrs</span><span>20 yrs</span>
      </div>
    </div>
  );
}

// ── RecruiterJobForm: for already-logged-in recruiters ────────────────────────

function parseBullets(text: string): string[] {
  return text.split('\n').map(l => l.trim()).filter(Boolean);
}

function RecruiterJobForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [skillInput, setSkillInput] = useState('');
  const [skillError, setSkillError] = useState('');
  const [form, setForm] = useState<JobForm>({
    title: '', description: '', location: '',
    jobType: 'Full-time', workMode: 'On-site',
    salaryMinLpa: 5, salaryMaxLpa: 20,
    requiredSkills: [],
    experienceMin: 0, experienceMax: 5,
    jobLevel: '', vacancies: '', closesAt: '',
    responsibilities: '', requirements: '',
    niceToHave: '', benefits: '',
  });
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

  function validate(): JobErrors {
    const e: JobErrors = {};
    if (!form.title.trim() || form.title.length < 5) e.title = 'Title must be at least 5 characters';
    if (form.title.trim().length > 150) e.title = 'Title must be under 150 characters';
    if (!form.description.trim() || form.description.length < 50) e.description = 'Description must be at least 50 characters';
    if (!form.location.trim()) e.location = 'Location is required';
    if (form.requiredSkills.length === 0) e.requiredSkills = 'Add at least one required skill';
    if (form.closesAt && new Date(form.closesAt) <= new Date()) e.closesAt = 'Deadline must be a future date';
    if (!form.responsibilities.trim()) e.responsibilities = 'At least one responsibility is required';
    if (!form.requirements.trim()) e.requirements = 'At least one requirement is required';
    return e;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const errs = validate();
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
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6" /></svg>
            Back
          </button>
          <h1 className="font-extrabold text-[#0f172a] text-2xl sm:text-[28px] mb-1" style={{ letterSpacing: -0.8 }}>Post a new job</h1>
          <p className="text-sm text-gray-500">Fill in the details below. You can edit the job after posting.</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 flex flex-col gap-5" style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
          <JobFields form={form} errors={errors} setField={set}
            skillInput={skillInput} setSkillInput={setSkillInput}
            skillError={skillError} setSkillError={setSkillError}
            skillSuggestions={skillSuggestions}
            addSkill={addSkill} removeSkill={removeSkill} />

          {error && (
            <div className="rounded-xl px-4 py-3 text-sm font-medium text-red-600 bg-red-50 border border-red-200">{error}</div>
          )}

          <div>
            <button type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 text-white font-bold text-[15px] rounded-xl py-3.5 transition-all"
              style={{ background: loading ? '#93aef5' : PRIMARY, cursor: loading ? 'not-allowed' : 'pointer' }}>
              {loading
                ? <><div className="w-4 h-4 border-[2.5px] border-white/40 border-t-white rounded-full animate-spin" /> Saving…</>
                : 'Save as Draft →'}
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

// ── JobFieldsBasic: step 2 — title, description, location, experience, type, salary ──

interface JobFieldsBasicProps {
  form: JobForm;
  errors: JobErrors;
  setField: (k: keyof JobForm, v: any) => void;
}

function JobFieldsBasic({ form, errors, setField }: JobFieldsBasicProps) {
  const inputCls = (hasError: boolean) =>
    `w-full rounded-xl border px-3.5 py-2.5 text-[13px] font-medium text-[#0f172a] outline-none transition-colors placeholder:text-gray-400 ${hasError ? 'border-red-400' : 'border-gray-200'}`;

  return (
    <>
      <div>
        <label className="block text-[13px] font-bold text-gray-600 mb-1.5">Job title <span style={{ color: PRIMARY }}>*</span></label>
        <input value={form.title} onChange={e => setField('title', e.target.value)}
          placeholder="e.g. Senior React Developer" className={inputCls(!!errors.title)} />
        {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
      </div>

      <div>
        <label className="block text-[13px] font-bold text-gray-600 mb-1.5">Job description <span style={{ color: PRIMARY }}>*</span></label>
        <textarea value={form.description} onChange={e => setField('description', e.target.value)} rows={6}
          placeholder="Describe the role, responsibilities, and requirements (min. 50 characters)..."
          className={`${inputCls(!!errors.description)} resize-none`} />
        <div className="flex items-center justify-between mt-1">
          {errors.description ? <p className="text-xs text-red-500">{errors.description}</p> : <span />}
          <span className="text-[11px] text-gray-400">{form.description.length} chars</span>
        </div>
      </div>

      <div>
        <label className="block text-[13px] font-bold text-gray-600 mb-1.5">Location <span style={{ color: PRIMARY }}>*</span></label>
        <input value={form.location} onChange={e => setField('location', e.target.value)}
          placeholder="e.g. Bengaluru / Remote" className={inputCls(!!errors.location)} />
        {errors.location && <p className="text-xs text-red-500 mt-1">{errors.location}</p>}
      </div>

      <ExperienceSlider minVal={form.experienceMin} maxVal={form.experienceMax}
        onChange={(min, max) => { setField('experienceMin', min); setField('experienceMax', max); }} />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-[13px] font-bold text-gray-600 mb-1.5">Job type</label>
          <select value={form.jobType} onChange={e => setField('jobType', e.target.value)}
            className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-[13px] font-medium text-[#0f172a] outline-none bg-white">
            {JOB_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-[13px] font-bold text-gray-600 mb-1.5">Work mode</label>
          <select value={form.workMode} onChange={e => setField('workMode', e.target.value)}
            className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-[13px] font-medium text-[#0f172a] outline-none bg-white">
            {WORK_MODES.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
      </div>

      <SalaryRangeSlider minLpa={form.salaryMinLpa} maxLpa={form.salaryMaxLpa}
        onChange={(min, max) => { setField('salaryMinLpa', min); setField('salaryMaxLpa', max); }} />
    </>
  );
}

// ── JobFieldsDetail: step 3 — level, vacancies, deadline, skills, responsibilities ──

interface JobFieldsDetailProps {
  form: JobForm;
  errors: JobErrors;
  setField: (k: keyof JobForm, v: any) => void;
  skillInput: string;
  setSkillInput: (v: string) => void;
  skillError: string;
  setSkillError: (v: string) => void;
  skillSuggestions: string[];
  addSkill: (override?: string, fromSuggestion?: boolean) => void;
  removeSkill: (skill: string) => void;
}

function JobFieldsDetail({ form, errors, setField, skillInput, setSkillInput, skillError, setSkillError, skillSuggestions, addSkill, removeSkill }: JobFieldsDetailProps) {
  const inputCls = (hasError: boolean) =>
    `w-full rounded-xl border px-3.5 py-2.5 text-[13px] font-medium text-[#0f172a] outline-none transition-colors placeholder:text-gray-400 ${hasError ? 'border-red-400' : 'border-gray-200'}`;

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-[13px] font-bold text-gray-600 mb-1.5">Job level</label>
          <select value={form.jobLevel} onChange={e => setField('jobLevel', e.target.value)}
            className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-[13px] font-medium text-[#0f172a] outline-none bg-white">
            <option value="">Select level</option>
            {JOB_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-[13px] font-bold text-gray-600 mb-1.5">Vacancies</label>
          <input type="number" min="1" value={form.vacancies} onChange={e => setField('vacancies', e.target.value)}
            placeholder="e.g. 2" className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-[13px] font-medium text-[#0f172a] outline-none" />
        </div>
        <div>
          <label className="block text-[13px] font-bold text-gray-600 mb-1.5">Application deadline</label>
          <input type="date" value={form.closesAt} onChange={e => setField('closesAt', e.target.value)}
            min={new Date(Date.now() + 86400000).toISOString().split('T')[0]}
            className={inputCls(!!errors.closesAt)} />
          {errors.closesAt && <p className="text-xs text-red-500 mt-1">{errors.closesAt}</p>}
        </div>
      </div>

      <div>
        <label className="block text-[13px] font-bold text-gray-600 mb-1.5">Required skills <span style={{ color: PRIMARY }}>*</span></label>
        <div className="flex gap-2 mb-2">
          <input value={skillInput} onChange={e => { setSkillInput(e.target.value); setSkillError(''); }}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } }}
            placeholder="Type to search skills (e.g. React, Node.js)"
            className={`flex-1 rounded-xl border px-3.5 py-2.5 text-[13px] font-medium text-[#0f172a] outline-none ${skillError || errors.requiredSkills ? 'border-red-400' : 'border-gray-200'}`} />
          <button type="button" onClick={() => addSkill()} className="px-4 py-2.5 rounded-xl text-[13px] font-bold text-white shrink-0" style={{ background: PRIMARY }}>Add</button>
        </div>
        {skillError && <p className="text-xs text-red-500 mb-2">{skillError}</p>}
        {skillSuggestions.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {skillSuggestions.map(s => (
              <button key={s} type="button" onClick={() => addSkill(s, true)}
                className="px-2.5 py-1 rounded-lg text-[12px] font-semibold bg-gray-100 text-gray-500 hover:bg-primary/10 hover:text-primary transition-colors">
                + {s}
              </button>
            ))}
          </div>
        )}
        {form.requiredSkills.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-1">
            {form.requiredSkills.map(s => (
              <span key={s} className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-semibold"
                style={{ background: `${PRIMARY}12`, color: PRIMARY, border: `1.5px solid ${PRIMARY}30` }}>
                {s}
                <button type="button" onClick={() => removeSkill(s)} className="hover:text-red-500 transition-colors">×</button>
              </span>
            ))}
          </div>
        )}
        {errors.requiredSkills && <p className="text-xs text-red-500 mt-1">{errors.requiredSkills}</p>}
      </div>

      <div>
        <label className="block text-[13px] font-bold text-gray-600 mb-1.5">Responsibilities <span style={{ color: PRIMARY }}>*</span></label>
        <textarea value={form.responsibilities} onChange={e => setField('responsibilities', e.target.value)} rows={5}
          placeholder={"Build and maintain scalable APIs\nCollaborate with cross-functional teams\nWrite unit and integration tests"}
          className={`${inputCls(!!errors.responsibilities)} resize-none`} />
        <p className="text-[11px] text-gray-400 mt-1">One item per line. Each line becomes a bullet point.</p>
        {errors.responsibilities && <p className="text-xs text-red-500 mt-1">{errors.responsibilities}</p>}
      </div>

      <div>
        <label className="block text-[13px] font-bold text-gray-600 mb-1.5">Requirements <span style={{ color: PRIMARY }}>*</span></label>
        <textarea value={form.requirements} onChange={e => setField('requirements', e.target.value)} rows={5}
          placeholder={"3+ years of experience with React\nStrong understanding of REST APIs\nExperience with PostgreSQL or similar"}
          className={`${inputCls(!!errors.requirements)} resize-none`} />
        <p className="text-[11px] text-gray-400 mt-1">One item per line.</p>
        {errors.requirements && <p className="text-xs text-red-500 mt-1">{errors.requirements}</p>}
      </div>

      <div>
        <label className="block text-[13px] font-bold text-gray-600 mb-1.5">Nice to have <span className="text-gray-400 font-normal text-[11px]">(optional)</span></label>
        <textarea value={form.niceToHave} onChange={e => setField('niceToHave', e.target.value)} rows={3}
          placeholder={"Experience with Docker/Kubernetes\nFamiliarity with GraphQL"}
          className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-[13px] font-medium text-[#0f172a] outline-none placeholder:text-gray-400 resize-none" />
        <p className="text-[11px] text-gray-400 mt-1">One item per line.</p>
      </div>

      <div>
        <label className="block text-[13px] font-bold text-gray-600 mb-1.5">Perks &amp; benefits <span className="text-gray-400 font-normal text-[11px]">(optional)</span></label>
        <textarea value={form.benefits} onChange={e => setField('benefits', e.target.value)} rows={3}
          placeholder={"Health insurance\nFlexible working hours\nAnnual learning budget"}
          className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-[13px] font-medium text-[#0f172a] outline-none placeholder:text-gray-400 resize-none" />
        <p className="text-[11px] text-gray-400 mt-1">One item per line.</p>
      </div>
    </>
  );
}

// ── JobFields: shared job form fields (used in both flows) ────────────────────

interface JobFieldsProps {
  form: JobForm;
  errors: JobErrors;
  setField: (k: keyof JobForm, v: any) => void;
  skillInput: string;
  setSkillInput: (v: string) => void;
  skillError: string;
  setSkillError: (v: string) => void;
  skillSuggestions: string[];
  addSkill: (override?: string, fromSuggestion?: boolean) => void;
  removeSkill: (skill: string) => void;
}

function JobFields({ form, errors, setField, skillInput, setSkillInput, skillError, setSkillError, skillSuggestions, addSkill, removeSkill }: JobFieldsProps) {
  const inputCls = (hasError: boolean) =>
    `w-full rounded-xl border px-3.5 py-2.5 text-[13px] font-medium text-[#0f172a] outline-none transition-colors placeholder:text-gray-400 ${hasError ? 'border-red-400' : 'border-gray-200'}`;

  return (
    <>
      {/* Title */}
      <div>
        <label className="block text-[13px] font-bold text-gray-600 mb-1.5">Job title <span style={{ color: PRIMARY }}>*</span></label>
        <input value={form.title} onChange={e => setField('title', e.target.value)}
          placeholder="e.g. Senior React Developer"
          className={inputCls(!!errors.title)} />
        {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
      </div>

      {/* Description */}
      <div>
        <label className="block text-[13px] font-bold text-gray-600 mb-1.5">Job description <span style={{ color: PRIMARY }}>*</span></label>
        <textarea value={form.description} onChange={e => setField('description', e.target.value)} rows={6}
          placeholder="Describe the role, responsibilities, and requirements (min. 50 characters)..."
          className={`${inputCls(!!errors.description)} resize-none`} />
        <div className="flex items-center justify-between mt-1">
          {errors.description ? <p className="text-xs text-red-500">{errors.description}</p> : <span />}
          <span className="text-[11px] text-gray-400">{form.description.length} chars</span>
        </div>
      </div>

      {/* Location */}
      <div>
        <label className="block text-[13px] font-bold text-gray-600 mb-1.5">Location <span style={{ color: PRIMARY }}>*</span></label>
        <input value={form.location} onChange={e => setField('location', e.target.value)}
          placeholder="e.g. Bengaluru / Remote"
          className={inputCls(!!errors.location)} />
        {errors.location && <p className="text-xs text-red-500 mt-1">{errors.location}</p>}
      </div>

      {/* Experience */}
      <ExperienceSlider minVal={form.experienceMin} maxVal={form.experienceMax}
        onChange={(min, max) => { setField('experienceMin', min); setField('experienceMax', max); }} />

      {/* Job type + Work mode */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-[13px] font-bold text-gray-600 mb-1.5">Job type</label>
          <select value={form.jobType} onChange={e => setField('jobType', e.target.value)}
            className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-[13px] font-medium text-[#0f172a] outline-none bg-white">
            {JOB_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-[13px] font-bold text-gray-600 mb-1.5">Work mode</label>
          <select value={form.workMode} onChange={e => setField('workMode', e.target.value)}
            className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-[13px] font-medium text-[#0f172a] outline-none bg-white">
            {WORK_MODES.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
      </div>

      {/* Salary */}
      <SalaryRangeSlider minLpa={form.salaryMinLpa} maxLpa={form.salaryMaxLpa}
        onChange={(min, max) => { setField('salaryMinLpa', min); setField('salaryMaxLpa', max); }} />

      {/* Level + Vacancies + Deadline */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-[13px] font-bold text-gray-600 mb-1.5">Job level</label>
          <select value={form.jobLevel} onChange={e => setField('jobLevel', e.target.value)}
            className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-[13px] font-medium text-[#0f172a] outline-none bg-white">
            <option value="">Select level</option>
            {JOB_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-[13px] font-bold text-gray-600 mb-1.5">Vacancies</label>
          <input type="number" min="1" value={form.vacancies} onChange={e => setField('vacancies', e.target.value)} placeholder="e.g. 2"
            className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-[13px] font-medium text-[#0f172a] outline-none" />
        </div>
        <div>
          <label className="block text-[13px] font-bold text-gray-600 mb-1.5">Application deadline</label>
          <input type="date" value={form.closesAt} onChange={e => setField('closesAt', e.target.value)}
            min={new Date(Date.now() + 86400000).toISOString().split('T')[0]}
            className={inputCls(!!errors.closesAt)} />
          {errors.closesAt && <p className="text-xs text-red-500 mt-1">{errors.closesAt}</p>}
        </div>
      </div>

      {/* Skills */}
      <div>
        <label className="block text-[13px] font-bold text-gray-600 mb-1.5">
          Required skills <span style={{ color: PRIMARY }}>*</span>
        </label>
        <div className="flex gap-2 mb-2">
          <input value={skillInput}
            onChange={e => { setSkillInput(e.target.value); setSkillError(''); }}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } }}
            placeholder="Type to search skills (e.g. React, Node.js)"
            className={`flex-1 rounded-xl border px-3.5 py-2.5 text-[13px] font-medium text-[#0f172a] outline-none ${skillError || errors.requiredSkills ? 'border-red-400' : 'border-gray-200'}`} />
          <button type="button" onClick={() => addSkill()}
            className="px-4 py-2.5 rounded-xl text-[13px] font-bold text-white shrink-0"
            style={{ background: PRIMARY }}>
            Add
          </button>
        </div>
        {skillError && <p className="text-xs text-red-500 mb-2">{skillError}</p>}
        {skillSuggestions.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {skillSuggestions.map(s => (
              <button key={s} type="button" onClick={() => addSkill(s, true)}
                className="px-2.5 py-1 rounded-lg text-[12px] font-semibold bg-gray-100 text-gray-500 hover:bg-primary/10 hover:text-primary transition-colors">
                + {s}
              </button>
            ))}
          </div>
        )}
        {form.requiredSkills.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-1">
            {form.requiredSkills.map(s => (
              <span key={s} className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-semibold"
                style={{ background: `${PRIMARY}12`, color: PRIMARY, border: `1.5px solid ${PRIMARY}30` }}>
                {s}
                <button type="button" onClick={() => removeSkill(s)} className="hover:text-red-500 transition-colors">×</button>
              </span>
            ))}
          </div>
        )}
        {errors.requiredSkills && <p className="text-xs text-red-500 mt-1">{errors.requiredSkills}</p>}
      </div>

      {/* Responsibilities */}
      <div>
        <label className="block text-[13px] font-bold text-gray-600 mb-1.5">
          Responsibilities <span style={{ color: PRIMARY }}>*</span>
        </label>
        <textarea value={form.responsibilities} onChange={e => setField('responsibilities', e.target.value)} rows={5}
          placeholder={"Build and maintain scalable APIs\nCollaborate with cross-functional teams\nWrite unit and integration tests"}
          className={`${inputCls(!!errors.responsibilities)} resize-none`} />
        <p className="text-[11px] text-gray-400 mt-1">One item per line. Each line becomes a bullet point.</p>
        {errors.responsibilities && <p className="text-xs text-red-500 mt-1">{errors.responsibilities}</p>}
      </div>

      {/* Requirements */}
      <div>
        <label className="block text-[13px] font-bold text-gray-600 mb-1.5">
          Requirements <span style={{ color: PRIMARY }}>*</span>
        </label>
        <textarea value={form.requirements} onChange={e => setField('requirements', e.target.value)} rows={5}
          placeholder={"3+ years of experience with React\nStrong understanding of REST APIs\nExperience with PostgreSQL or similar"}
          className={`${inputCls(!!errors.requirements)} resize-none`} />
        <p className="text-[11px] text-gray-400 mt-1">One item per line.</p>
        {errors.requirements && <p className="text-xs text-red-500 mt-1">{errors.requirements}</p>}
      </div>

      {/* Nice to have */}
      <div>
        <label className="block text-[13px] font-bold text-gray-600 mb-1.5">
          Nice to have <span className="text-gray-400 font-normal text-[11px]">(optional)</span>
        </label>
        <textarea value={form.niceToHave} onChange={e => setField('niceToHave', e.target.value)} rows={3}
          placeholder={"Experience with Docker/Kubernetes\nFamiliarity with GraphQL"}
          className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-[13px] font-medium text-[#0f172a] outline-none placeholder:text-gray-400 resize-none" />
        <p className="text-[11px] text-gray-400 mt-1">One item per line.</p>
      </div>

      {/* Benefits */}
      <div>
        <label className="block text-[13px] font-bold text-gray-600 mb-1.5">
          Perks &amp; benefits <span className="text-gray-400 font-normal text-[11px]">(optional)</span>
        </label>
        <textarea value={form.benefits} onChange={e => setField('benefits', e.target.value)} rows={3}
          placeholder={"Health insurance\nFlexible working hours\nAnnual learning budget"}
          className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-[13px] font-medium text-[#0f172a] outline-none placeholder:text-gray-400 resize-none" />
        <p className="text-[11px] text-gray-400 mt-1">One item per line.</p>
      </div>
    </>
  );
}

// ── Main public "Post a Free Job" page ────────────────────────────────────────

export default function RecruiterPostJobPage() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [postedJobId, setPostedJobId] = useState('');

  // Account form (step 1)
  const [account, setAccount] = useState<AccountForm>({
    fullName: '', companyName: '', email: '', password: '', terms: false,
  });
  const [accountErrors, setAccountErrors] = useState<AccountErrors>({});

  // Job form (step 2)
  const [job, setJob] = useState<JobForm>({
    title: '', description: '', location: '',
    jobType: 'Full-time', workMode: 'On-site',
    salaryMinLpa: 5, salaryMaxLpa: 20,
    requiredSkills: [],
    experienceMin: 0, experienceMax: 5,
    jobLevel: '', vacancies: '', closesAt: '',
    responsibilities: '', requirements: '',
    niceToHave: '', benefits: '',
  });
  const [jobErrors, setJobErrors] = useState<JobErrors>({});
  const [skillInput, setSkillInput] = useState('');
  const [skillError, setSkillError] = useState('');
  const skillSuggestions = useSkillSuggestions(skillInput, job.requiredSkills);

  useEffect(() => {
    const token = safeLocalStorageGetItem('recruiter_token');
    const payload = token ? decodeJwtPayload(token) : null;
    const valid = Boolean(token && payload && payload.role?.toLowerCase() === 'recruiter' && !(payload.exp && Date.now() / 1000 >= payload.exp));
    setIsLoggedIn(valid);
  }, []);

  if (isLoggedIn === null) return null;
  if (isLoggedIn) return <RecruiterJobForm />;

  // ── Account helpers ──

  function setAccountField<K extends keyof AccountForm>(k: K, v: AccountForm[K]) {
    setAccount(f => ({ ...f, [k]: v }));
    setAccountErrors(e => ({ ...e, [k]: undefined }));
    setApiError('');
  }

  function validateAccount(): AccountErrors {
    const e: AccountErrors = {};
    if (!account.fullName.trim()) e.fullName = 'Full name is required';
    if (!account.companyName.trim()) e.companyName = 'Company name is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(account.email)) e.email = 'Enter a valid work email';
    if (!account.password || account.password.length < 8) e.password = 'Password must be at least 8 characters';
    if (!account.terms) e.terms = 'You must accept the Terms & Conditions';
    return e;
  }

  function handleAccountContinue(e: FormEvent) {
    e.preventDefault();
    const errs = validateAccount();
    if (Object.keys(errs).length) { setAccountErrors(errs); scrollToFirstError(); return; }
    setStep(1);
    window.scrollTo(0, 0);
  }

  // ── Job helpers ──

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

  function validateJobBasic(): JobErrors {
    const e: JobErrors = {};
    if (!job.title.trim() || job.title.length < 5) e.title = 'Title must be at least 5 characters';
    if (job.title.trim().length > 150) e.title = 'Title must be under 150 characters';
    if (!job.description.trim() || job.description.length < 50) e.description = 'Description must be at least 50 characters';
    if (!job.location.trim()) e.location = 'Location is required';
    return e;
  }

  function handleJobBasicContinue(e: FormEvent) {
    e.preventDefault();
    const errs = validateJobBasic();
    if (Object.keys(errs).length) { setJobErrors(errs); scrollToFirstError(); return; }
    setJobErrors({});
    setStep(2);
    window.scrollTo(0, 0);
  }

  function validateJobDetail(): JobErrors {
    const e: JobErrors = {};
    if (job.requiredSkills.length === 0) e.requiredSkills = 'Add at least one required skill';
    if (job.closesAt && new Date(job.closesAt) <= new Date()) e.closesAt = 'Deadline must be a future date';
    if (!job.responsibilities.trim()) e.responsibilities = 'At least one responsibility is required';
    if (!job.requirements.trim()) e.requirements = 'At least one requirement is required';
    return e;
  }

  async function handleJobSubmit(e: FormEvent) {
    e.preventDefault();
    const errs = validateJobDetail();
    if (Object.keys(errs).length) { setJobErrors(errs); scrollToFirstError(); return; }

    setLoading(true);
    setApiError('');
    try {
      // 1. Create recruiter account (also sets token in localStorage)
      await signupRecruiter({
        full_name: account.fullName.trim(),
        company_name: account.companyName.trim(),
        email: account.email.trim(),
        password: account.password,
        terms_accepted: account.terms,
      });

      // 2. Post the job using the freshly stored token
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

  // ── Success screen ──

  if (postedJobId) {
    return (
      <div className="min-h-screen flex items-center justify-center p-5 sm:p-6" style={{ fontFamily: 'var(--font-plus-jakarta)', background: '#f8faff' }}>
        <div className="text-center rounded-3xl w-full px-6 py-10 sm:px-12 sm:py-14" style={{ background: '#fff', maxWidth: 460, boxShadow: `0 24px 64px ${PRIMARY}12` }}>
          <div className="flex items-center justify-center rounded-full mx-auto mb-6" style={{ width: 80, height: 80, background: '#f0fdf4', border: '2px solid #bbf7d0' }}>
            <svg width="36" height="36" fill="none" stroke="#22c55e" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" /></svg>
          </div>
          <h2 className="font-extrabold text-[#0f172a] mb-2" style={{ fontSize: 26, letterSpacing: -0.8 }}>
            Account created & job posted!
          </h2>
          <p className="text-sm text-gray-500 mb-2 leading-relaxed">
            Your recruiter account at <strong style={{ color: PRIMARY }}>itJobwala</strong> is ready and your job is live as a draft.
          </p>
          <p className="text-[13px] text-gray-400 mb-8">
            Review and publish your job from the dashboard to start receiving applications.
          </p>
          <Link href={`/recruiter/posted-jobs/${postedJobId}`}
            className="block text-white rounded-xl font-bold text-[15px] text-center mb-3 py-3.5 transition-all"
            style={{ background: PRIMARY, textDecoration: 'none' }}
            onMouseEnter={e => { e.currentTarget.style.background = '#0d3fd4'; }}
            onMouseLeave={e => { e.currentTarget.style.background = PRIMARY; }}>
            View &amp; publish your job →
          </Link>
          <Link href="/recruiter/dashboard"
            className="block text-[13px] font-semibold"
            style={{ color: PRIMARY, textDecoration: 'none' }}>
            Go to dashboard
          </Link>
        </div>
      </div>
    );
  }

  // ── Shared navbar ──

  const Navbar = () => (
    <nav className="sticky top-0 z-[200] border-b border-black/[0.06] shrink-0" style={{ background: 'rgba(255,255,255,0.96)', backdropFilter: 'blur(14px)' }}>
      <div className="max-w-[1440px] mx-auto px-5 lg:px-10 flex items-center justify-between h-[68px]">
        <Link href="/" className="flex items-center gap-1 hover:opacity-80 transition-opacity">
          <Image src="/logo.png" alt="itJobwala" width={30} height={30} />
          <span className="font-extrabold text-xl text-[#0f172a]" style={{ letterSpacing: '-0.5px' }}>
            it<span style={{ color: PRIMARY }}>Jobwala</span>
          </span>
        </Link>
        <div className="flex items-center gap-3 sm:gap-5">
          <span className="hidden sm:inline text-[13px] text-gray-500">Already a recruiter?</span>
          <Link href="/auth/login?role=recruiter"
            className="text-sm font-bold rounded-lg px-4 sm:px-[18px] py-2 transition-all duration-200"
            style={{ color: PRIMARY, border: `1.5px solid ${PRIMARY}`, textDecoration: 'none' }}
            onMouseEnter={e => { e.currentTarget.style.background = PRIMARY; e.currentTarget.style.color = '#fff'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = PRIMARY; }}>
            Log in
          </Link>
        </div>
      </div>
    </nav>
  );

  return (
    <div className="min-h-screen flex flex-col" style={{ fontFamily: 'var(--font-plus-jakarta)', background: '#f8faff' }}>
      <Navbar />

      <div className="flex-1 flex">
        <LeftPanel />

        {/* Form panel */}
        <div className="flex-1 flex items-start justify-center overflow-y-auto px-5 py-10 sm:px-10 sm:py-12 lg:px-14 lg:py-14">
          <div className="w-full max-w-[520px]">

            {/* Title */}
            <div className="mb-2">
              <h1 className="font-extrabold text-[#0f172a] mb-1 text-2xl sm:text-[26px]" style={{ letterSpacing: -0.8 }}>
                {step === 0 ? 'Create your free account' : step === 1 ? 'Job basics' : 'Job details'}
              </h1>
              <p className="text-sm text-gray-500">
                {step === 0 ? 'Step 1 of 3 — Account details' : step === 1 ? 'Step 2 of 3 — Basic job info' : 'Step 3 of 3 — Skills & description'}
              </p>
            </div>

            <div className="my-6">
              <StepBar current={step} />
            </div>

            {/* ── Step 1: Account ── */}
            {step === 0 && (
              <form onSubmit={handleAccountContinue} noValidate>
                <Field
                  label="Full Name" id="fullName" placeholder="e.g. Amit Sharma"
                  value={account.fullName} onChange={v => setAccountField('fullName', v)} error={accountErrors.fullName}
                  icon={<svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>}
                />
                <Field
                  label="Company Name" id="companyName" placeholder="e.g. Razorpay"
                  value={account.companyName} onChange={v => setAccountField('companyName', v)} error={accountErrors.companyName}
                  icon={<svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>}
                />
                <Field
                  label="Work Email" id="email" type="email" placeholder="you@company.com"
                  value={account.email} onChange={v => setAccountField('email', v)} error={accountErrors.email}
                  hint={<span className="text-[11px] text-gray-400 font-normal">Use your official company email</span>}
                  icon={<svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>}
                />
                <PasswordField
                  label="Password" id="password" placeholder="Min. 8 characters"
                  value={account.password} onChange={v => setAccountField('password', v)} error={accountErrors.password}
                />

                {/* Terms */}
                <div className="mb-6">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <div className="relative shrink-0 mt-0.5">
                      <input type="checkbox" checked={account.terms} onChange={e => setAccountField('terms', e.target.checked)} className="sr-only" />
                      <div className="flex items-center justify-center rounded-[6px] border-2 transition-all duration-[180ms]"
                        style={{ width: 20, height: 20, borderColor: account.terms ? PRIMARY : accountErrors.terms ? '#ef4444' : '#d1d5db', background: account.terms ? PRIMARY : '#fff' }}>
                        {account.terms && <svg width="10" height="10" fill="none" stroke="#fff" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" /></svg>}
                      </div>
                    </div>
                    <span className="text-[13px] text-gray-600 leading-[1.6]">
                      I agree to itJobwala's{' '}
                      <Link href="#" className="font-semibold" style={{ color: PRIMARY, textDecoration: 'none' }}>Terms of Service</Link>
                      {' '}and{' '}
                      <Link href="#" className="font-semibold" style={{ color: PRIMARY, textDecoration: 'none' }}>Recruiter Policy</Link>
                    </span>
                  </label>
                  {accountErrors.terms && <p className="text-xs text-red-500 mt-1.5 font-medium">{accountErrors.terms}</p>}
                </div>

                <button type="submit"
                  className="w-full flex items-center justify-center gap-2.5 text-white border-none rounded-xl font-bold text-[15px] transition-all duration-200"
                  style={{ padding: 15, background: PRIMARY, boxShadow: `0 4px 20px ${PRIMARY}44`, cursor: 'pointer' }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#0d3fd4'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = PRIMARY; }}>
                  Continue to post your job →
                </button>

                {/* Divider + Google */}
                <div className="flex items-center gap-3 mt-5 mb-4">
                  <div className="flex-1 h-px bg-gray-200" />
                  <span className="text-xs font-semibold text-gray-400">or</span>
                  <div className="flex-1 h-px bg-gray-200" />
                </div>
                <button type="button"
                  className="w-full flex items-center justify-center gap-2.5 bg-white rounded-xl font-semibold text-sm text-gray-700 cursor-pointer transition-all duration-200"
                  style={{ border: '1.5px solid #e5e7eb', padding: 13 }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = PRIMARY; e.currentTarget.style.background = '#f8faff'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.background = '#fff'; }}>
                  <svg width="18" height="18" viewBox="0 0 48 48">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.29-8.16 2.29-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                  </svg>
                  Continue with Google
                </button>

                <p className="text-center text-[13px] text-gray-400 mt-5">
                  Looking for a job?{' '}
                  <Link href="/auth/signup" className="font-bold" style={{ color: PRIMARY, textDecoration: 'none' }}>Sign up as candidate</Link>
                </p>
              </form>
            )}

            {/* ── Step 2: Job Basics ── */}
            {step === 1 && (
              <form onSubmit={handleJobBasicContinue} noValidate className="flex flex-col gap-5">
                <JobFieldsBasic form={job} errors={jobErrors} setField={setJobField} />

                <div className="flex gap-3 pt-1">
                  <button type="button" onClick={() => { setStep(0); setApiError(''); }}
                    className="flex-1 bg-white font-semibold text-[14px] rounded-xl transition-all duration-200"
                    style={{ color: '#374151', border: '1.5px solid #e5e7eb', padding: 13 }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = PRIMARY; e.currentTarget.style.color = PRIMARY; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.color = '#374151'; }}>
                    ← Back
                  </button>
                  <button type="submit"
                    className="flex-[2] flex items-center justify-center gap-2.5 text-white border-none rounded-xl font-bold text-[15px] transition-all duration-200"
                    style={{ padding: 14, cursor: 'pointer', background: PRIMARY, boxShadow: `0 4px 18px ${PRIMARY}44` }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#0d3fd4'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = PRIMARY; }}>
                    Continue →
                  </button>
                </div>
              </form>
            )}

            {/* ── Step 3: Job Details ── */}
            {step === 2 && (
              <form onSubmit={handleJobSubmit} noValidate className="flex flex-col gap-5">
                <JobFieldsDetail
                  form={job} errors={jobErrors} setField={setJobField}
                  skillInput={skillInput} setSkillInput={setSkillInput}
                  skillError={skillError} setSkillError={setSkillError}
                  skillSuggestions={skillSuggestions}
                  addSkill={addSkill} removeSkill={removeSkill}
                />

                {apiError && (
                  <div className="rounded-xl px-4 py-3 text-sm font-medium text-red-600 bg-red-50 border border-red-200">{apiError}</div>
                )}

                <div className="flex gap-3 pt-1">
                  <button type="button" onClick={() => { setStep(1); setApiError(''); }}
                    className="flex-1 bg-white font-semibold text-[14px] rounded-xl transition-all duration-200"
                    style={{ color: '#374151', border: '1.5px solid #e5e7eb', padding: 13 }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = PRIMARY; e.currentTarget.style.color = PRIMARY; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.color = '#374151'; }}>
                    ← Back
                  </button>
                  <button type="submit" disabled={loading}
                    className="flex-[2] flex items-center justify-center gap-2.5 text-white border-none rounded-xl font-bold text-[15px] transition-all duration-200"
                    style={{
                      padding: 14, cursor: loading ? 'not-allowed' : 'pointer',
                      background: loading ? '#93aef5' : PRIMARY,
                      boxShadow: loading ? 'none' : `0 4px 18px ${PRIMARY}44`,
                    }}
                    onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#0d3fd4'; }}
                    onMouseLeave={e => { if (!loading) e.currentTarget.style.background = PRIMARY; }}>
                    {loading
                      ? <><div className="w-4 h-4 border-[2.5px] border-white/40 border-t-white rounded-full animate-spin" /> Creating account &amp; posting…</>
                      : 'Create account & post job →'
                    }
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
