'use client';

import { PRIMARY } from '@/src/lib/constants';
import type { JobForm, JobErrors } from '../../schemas/postJob.schema';
import { JOB_LEVELS } from '../../schemas/postJob.schema';

interface Props {
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

// Design-spec Input Field: 44px mobile -> 48px desktop, 16px font, 8px radius
const inputCls = (hasError: boolean) =>
  `w-full h-11 lg:h-12 rounded-sm border px-3.5 lg:px-4 text-lg font-medium text-heading outline-none transition-colors placeholder:text-muted ${hasError ? 'border-danger' : 'border-token'}`;

const textareaCls = (hasError: boolean) =>
  `w-full rounded-sm border px-3.5 py-3 text-lg font-medium text-heading outline-none transition-colors placeholder:text-muted ${hasError ? 'border-danger' : 'border-token'}`;

export default function JobFieldsDetail({
  form, errors, setField,
  skillInput, setSkillInput, skillError, setSkillError,
  skillSuggestions, addSkill, removeSkill,
}: Props) {
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-bold text-body-secondary mb-1.5">Job level</label>
          <div className="relative">
            <select value={form.jobLevel} onChange={e => setField('jobLevel', e.target.value)}
              className="w-full h-11 lg:h-12 appearance-none rounded-sm border border-token pl-3.5 lg:pl-4 pr-9 text-lg font-medium text-heading outline-none bg-surface">
              <option value="">Select level</option>
              {JOB_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"
              className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-subtle">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </div>
        </div>
        <div>
          <label className="block text-sm font-bold text-body-secondary mb-1.5">Vacancies</label>
          <input type="number" min="1" step="1" value={form.vacancies} onChange={e => setField('vacancies', e.target.value)}
            placeholder="e.g. 2" className={inputCls(!!errors.vacancies)} />
          {errors.vacancies && <p className="text-xs text-danger mt-1">{errors.vacancies}</p>}
        </div>
        <div>
          <label className="block text-sm font-bold text-body-secondary mb-1.5">Application deadline</label>
          <input type="date" value={form.closesAt} onChange={e => setField('closesAt', e.target.value)}
            min={new Date(Date.now() + 86400000).toISOString().split('T')[0]}
            className={inputCls(!!errors.closesAt)} />
          {errors.closesAt && <p className="text-xs text-danger mt-1">{errors.closesAt}</p>}
        </div>
      </div>

      <div>
        <label className="block text-sm font-bold text-body-secondary mb-1.5">Required skills <span style={{ color: PRIMARY }}>*</span></label>
        <div className="flex gap-2 mb-2">
          <input value={skillInput}
            onChange={e => { setSkillInput(e.target.value); setSkillError(''); }}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } }}
            placeholder="Type to search skills (e.g. Selenium, Postman)"
            className={`flex-1 h-11 lg:h-12 rounded-sm border px-3.5 lg:px-4 text-lg font-medium text-heading outline-none ${skillError || errors.requiredSkills ? 'border-danger' : 'border-token'}`} />
          <button type="button" onClick={() => addSkill()}
            className="self-center h-9 px-4 rounded-sm text-sm font-bold text-white shrink-0"
            style={{ background: PRIMARY }}>Add</button>
        </div>
        {skillError && <p className="text-xs text-danger mb-2">{skillError}</p>}
        {skillSuggestions.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {skillSuggestions.map(s => (
              <button key={s} type="button" onClick={() => addSkill(s, true)}
                className="px-2.5 py-1 rounded-full text-caption font-semibold bg-surface-hover text-muted hover:bg-primary/10 hover:text-primary transition-colors">
                + {s}
              </button>
            ))}
          </div>
        )}
        {form.requiredSkills.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-1">
            {form.requiredSkills.map(s => (
              <span key={s} className="flex items-center gap-1.5 px-3 py-2 rounded-full text-[14px] font-semibold"
                style={{ background: `${PRIMARY}12`, color: PRIMARY, border: `1.5px solid ${PRIMARY}30` }}>
                {s}
                <button type="button" onClick={() => removeSkill(s)} className="hover:text-red-500 transition-colors">×</button>
              </span>
            ))}
          </div>
        )}
        {errors.requiredSkills && <p className="text-xs text-danger mt-1">{errors.requiredSkills}</p>}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-bold text-body-secondary mb-1.5">Responsibilities <span style={{ color: PRIMARY }}>*</span></label>
          <textarea value={form.responsibilities} onChange={e => setField('responsibilities', e.target.value)} rows={5}
            placeholder={"Design and execute test cases for web and mobile releases\nAutomate regression suites using Selenium/Playwright\nLog, triage, and verify bug fixes in JIRA"}
            className={`${textareaCls(!!errors.responsibilities)} resize-none`} />
          <p className="text-micro text-subtle mt-1">One item per line. Each line becomes a bullet point.</p>
          {errors.responsibilities && <p className="text-xs text-danger mt-1">{errors.responsibilities}</p>}
        </div>

        <div>
          <label className="block text-sm font-bold text-body-secondary mb-1.5">Requirements <span style={{ color: PRIMARY }}>*</span></label>
          <textarea value={form.requirements} onChange={e => setField('requirements', e.target.value)} rows={5}
            placeholder={"3+ years of experience in manual or automation testing\nStrong understanding of API testing tools like Postman or Rest Assured\nExperience with test management tools like JIRA or TestRail"}
            className={`${textareaCls(!!errors.requirements)} resize-none`} />
          <p className="text-micro text-subtle mt-1">One item per line.</p>
          {errors.requirements && <p className="text-xs text-danger mt-1">{errors.requirements}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-bold text-body-secondary mb-1.5">
            Nice to have <span className="text-subtle font-normal text-micro">(optional)</span>
          </label>
          <textarea value={form.niceToHave} onChange={e => setField('niceToHave', e.target.value)} rows={3}
            placeholder={"ISTQB certification\nExperience with CI/CD pipelines (Jenkins, GitHub Actions)"}
            className="w-full rounded-sm border border-token px-3.5 py-3 text-lg font-medium text-heading outline-none placeholder:text-muted resize-none" />
          <p className="text-micro text-subtle mt-1">One item per line.</p>
        </div>

        <div>
          <label className="block text-sm font-bold text-body-secondary mb-1.5">
            Perks &amp; benefits <span className="text-subtle font-normal text-micro">(optional)</span>
          </label>
          <textarea value={form.benefits} onChange={e => setField('benefits', e.target.value)} rows={3}
            placeholder={"Health insurance\nFlexible working hours\nAnnual learning budget"}
            className="w-full rounded-sm border border-token px-3.5 py-3 text-lg font-medium text-heading outline-none placeholder:text-muted resize-none" />
          <p className="text-micro text-subtle mt-1">One item per line.</p>
        </div>
      </div>
    </>
  );
}
