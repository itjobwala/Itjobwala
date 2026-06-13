'use client';

import SalaryRangeSlider from '@/src/components/ui/SalaryRangeSlider';
import { PRIMARY } from '@/src/lib/constants';
import ExperienceSlider from './ExperienceSlider';
import type { JobForm, JobErrors } from '../../schemas/postJob.schema';
import { JOB_TYPES, WORK_MODES } from '../../schemas/postJob.schema';

interface Props {
  form: JobForm;
  errors: JobErrors;
  setField: (k: keyof JobForm, v: any) => void;
}

const inputCls = (hasError: boolean) =>
  `w-full rounded-xl border px-3.5 py-2.5 text-sm font-medium text-heading outline-none transition-colors placeholder:text-subtle ${hasError ? 'border-danger' : 'border-token'}`;

export default function JobFieldsBasic({ form, errors, setField }: Props) {
  return (
    <>
      <div>
        <label className="block text-sm font-bold text-body-secondary mb-1.5">Job title <span style={{ color: PRIMARY }}>*</span></label>
        <input value={form.title} onChange={e => setField('title', e.target.value)}
          placeholder="e.g. Senior React Developer" className={inputCls(!!errors.title)} />
        {errors.title && <p className="text-xs text-danger mt-1">{errors.title}</p>}
      </div>

      <div>
        <label className="block text-sm font-bold text-body-secondary mb-1.5">Job description <span style={{ color: PRIMARY }}>*</span></label>
        <textarea value={form.description} onChange={e => setField('description', e.target.value)} rows={6}
          placeholder="Describe the role, responsibilities, and requirements (min. 50 characters)..."
          className={`${inputCls(!!errors.description)} resize-none`} />
        <div className="flex items-center justify-between mt-1">
          {errors.description ? <p className="text-xs text-danger">{errors.description}</p> : <span />}
          <span className="text-micro text-subtle">{form.description.length} chars</span>
        </div>
      </div>

      <div>
        <label className="block text-sm font-bold text-body-secondary mb-1.5">Location <span style={{ color: PRIMARY }}>*</span></label>
        <input value={form.location} onChange={e => setField('location', e.target.value)}
          placeholder="e.g. Bengaluru / Remote" className={inputCls(!!errors.location)} />
        {errors.location && <p className="text-xs text-danger mt-1">{errors.location}</p>}
      </div>

      <ExperienceSlider minVal={form.experienceMin} maxVal={form.experienceMax}
        onChange={(min, max) => { setField('experienceMin', min); setField('experienceMax', max); }} />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-bold text-body-secondary mb-1.5">Job type</label>
          <select value={form.jobType} onChange={e => setField('jobType', e.target.value)}
            className="w-full rounded-xl border border-token px-3.5 py-2.5 text-sm font-medium text-heading outline-none bg-surface">
            {JOB_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-bold text-body-secondary mb-1.5">Work mode</label>
          <select value={form.workMode} onChange={e => setField('workMode', e.target.value)}
            className="w-full rounded-xl border border-token px-3.5 py-2.5 text-sm font-medium text-heading outline-none bg-surface">
            {WORK_MODES.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
      </div>

      <SalaryRangeSlider minLpa={form.salaryMinLpa} maxLpa={form.salaryMaxLpa}
        minAllowed={1}
        onChange={(min, max) => { setField('salaryMinLpa', min); setField('salaryMaxLpa', max); }} />
    </>
  );
}
