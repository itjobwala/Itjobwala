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

const inputCls = (hasError: boolean) =>
  `w-full rounded-xl border px-3.5 py-2.5 text-sm font-medium text-heading outline-none transition-colors placeholder:text-subtle ${hasError ? 'border-danger' : 'border-token'}`;

export default function JobFieldsDetail({
  form, errors, setField,
  skillInput, setSkillInput, skillError, setSkillError,
  skillSuggestions, addSkill, removeSkill,
}: Props) {
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-bold text-body-secondary mb-1.5">Job level</label>
          <select value={form.jobLevel} onChange={e => setField('jobLevel', e.target.value)}
            className="w-full rounded-xl border border-token px-3.5 py-2.5 text-sm font-medium text-heading outline-none bg-surface">
            <option value="">Select level</option>
            {JOB_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
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
            placeholder="Type to search skills (e.g. React, Node.js)"
            className={`flex-1 rounded-xl border px-3.5 py-2.5 text-sm font-medium text-heading outline-none ${skillError || errors.requiredSkills ? 'border-danger' : 'border-token'}`} />
          <button type="button" onClick={() => addSkill()}
            className="px-4 py-2.5 rounded-full text-sm font-bold text-white shrink-0"
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
              <span key={s} className="flex items-center gap-1.5 px-3 py-1 rounded-full text-caption font-semibold"
                style={{ background: `${PRIMARY}12`, color: PRIMARY, border: `1.5px solid ${PRIMARY}30` }}>
                {s}
                <button type="button" onClick={() => removeSkill(s)} className="hover:text-red-500 transition-colors">×</button>
              </span>
            ))}
          </div>
        )}
        {errors.requiredSkills && <p className="text-xs text-danger mt-1">{errors.requiredSkills}</p>}
      </div>

      <div>
        <label className="block text-sm font-bold text-body-secondary mb-1.5">Responsibilities <span style={{ color: PRIMARY }}>*</span></label>
        <textarea value={form.responsibilities} onChange={e => setField('responsibilities', e.target.value)} rows={5}
          placeholder={"Build and maintain scalable APIs\nCollaborate with cross-functional teams\nWrite unit and integration tests"}
          className={`${inputCls(!!errors.responsibilities)} resize-none`} />
        <p className="text-micro text-subtle mt-1">One item per line. Each line becomes a bullet point.</p>
        {errors.responsibilities && <p className="text-xs text-danger mt-1">{errors.responsibilities}</p>}
      </div>

      <div>
        <label className="block text-sm font-bold text-body-secondary mb-1.5">Requirements <span style={{ color: PRIMARY }}>*</span></label>
        <textarea value={form.requirements} onChange={e => setField('requirements', e.target.value)} rows={5}
          placeholder={"3+ years of experience with React\nStrong understanding of REST APIs\nExperience with PostgreSQL or similar"}
          className={`${inputCls(!!errors.requirements)} resize-none`} />
        <p className="text-micro text-subtle mt-1">One item per line.</p>
        {errors.requirements && <p className="text-xs text-danger mt-1">{errors.requirements}</p>}
      </div>

      <div>
        <label className="block text-sm font-bold text-body-secondary mb-1.5">
          Nice to have <span className="text-subtle font-normal text-micro">(optional)</span>
        </label>
        <textarea value={form.niceToHave} onChange={e => setField('niceToHave', e.target.value)} rows={3}
          placeholder={"Experience with Docker/Kubernetes\nFamiliarity with GraphQL"}
          className="w-full rounded-xl border border-token px-3.5 py-2.5 text-sm font-medium text-heading outline-none placeholder:text-subtle resize-none" />
        <p className="text-micro text-subtle mt-1">One item per line.</p>
      </div>

      <div>
        <label className="block text-sm font-bold text-body-secondary mb-1.5">
          Perks &amp; benefits <span className="text-subtle font-normal text-micro">(optional)</span>
        </label>
        <textarea value={form.benefits} onChange={e => setField('benefits', e.target.value)} rows={3}
          placeholder={"Health insurance\nFlexible working hours\nAnnual learning budget"}
          className="w-full rounded-xl border border-token px-3.5 py-2.5 text-sm font-medium text-heading outline-none placeholder:text-subtle resize-none" />
        <p className="text-micro text-subtle mt-1">One item per line.</p>
      </div>
    </>
  );
}
