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
  disabled?: boolean;
}

// Design-spec Input Field: 44px mobile -> 48px desktop, 16px font, 8px radius
const inputCls = (hasError: boolean) =>
  `w-full h-11 lg:h-12 rounded-sm border px-3.5 lg:px-4 text-lg font-medium text-heading outline-none transition-colors placeholder:text-muted disabled:bg-surface-alt disabled:text-subtle disabled:cursor-not-allowed ${hasError ? 'border-danger' : 'border-token'}`;

const textareaCls = (hasError: boolean) =>
  `w-full rounded-sm border px-3.5 py-3 text-lg font-medium text-heading outline-none transition-colors placeholder:text-muted disabled:bg-surface-alt disabled:text-subtle disabled:cursor-not-allowed ${hasError ? 'border-danger' : 'border-token'}`;

export default function JobFieldsBasic({ form, errors, setField, disabled = false }: Props) {
  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-bold text-body-secondary mb-1.5">Job title <span style={{ color: PRIMARY }}>*</span></label>
          <input value={form.title} onChange={e => setField('title', e.target.value)} disabled={disabled}
            placeholder="e.g. Senior QA Automation Engineer" className={inputCls(!!errors.title)} />
          {errors.title && <p className="text-xs text-danger mt-1">{errors.title}</p>}
        </div>

        <div>
          <label className="block text-sm font-bold text-body-secondary mb-1.5">Location <span style={{ color: PRIMARY }}>*</span></label>
          <input value={form.location} onChange={e => setField('location', e.target.value)} disabled={disabled}
            placeholder="e.g. Bengaluru / Remote" className={inputCls(!!errors.location)} />
          {errors.location && <p className="text-xs text-danger mt-1">{errors.location}</p>}
        </div>
      </div>

      <div>
        <label className="block text-sm font-bold text-body-secondary mb-1.5">Job description <span style={{ color: PRIMARY }}>*</span></label>
        <textarea value={form.description} onChange={e => setField('description', e.target.value)} disabled={disabled} rows={5}
          placeholder="Describe the role, responsibilities, and requirements (min. 50 characters)..."
          className={`${textareaCls(!!errors.description)} resize-none`} />
        <div className="flex items-center justify-between mt-1">
          {errors.description ? <p className="text-xs text-danger">{errors.description}</p> : <span />}
          <span className="text-micro text-subtle">{form.description.length} chars</span>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row lg:items-start gap-4">
        <div className="lg:w-[180px] shrink-0">
          <label className="block text-sm font-bold text-body-secondary mb-1.5">Job type</label>
          <div className="relative">
            <select value={form.jobType} onChange={e => setField('jobType', e.target.value)} disabled={disabled}
              className="w-full h-11 lg:h-12 appearance-none rounded-sm border border-token pl-3.5 lg:pl-4 pr-9 text-lg font-medium text-heading outline-none bg-surface disabled:bg-surface-alt disabled:text-subtle disabled:cursor-not-allowed">
              {JOB_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"
              className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-subtle">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </div>
        </div>
        <div className="lg:w-[180px] shrink-0">
          <label className="block text-sm font-bold text-body-secondary mb-1.5">Work mode</label>
          <div className="relative">
            <select value={form.workMode} onChange={e => setField('workMode', e.target.value)} disabled={disabled}
              className="w-full h-11 lg:h-12 appearance-none rounded-sm border border-token pl-3.5 lg:pl-4 pr-9 text-lg font-medium text-heading outline-none bg-surface disabled:bg-surface-alt disabled:text-subtle disabled:cursor-not-allowed">
              {WORK_MODES.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"
              className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-subtle">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <ExperienceSlider minVal={form.experienceMin} maxVal={form.experienceMax}
            onChange={(min, max) => { setField('experienceMin', min); setField('experienceMax', max); }} />
        </div>
        <div className="flex-1 min-w-0">
          <SalaryRangeSlider minLpa={form.salaryMinLpa} maxLpa={form.salaryMaxLpa}
            minAllowed={1}
            onChange={(min, max) => { setField('salaryMinLpa', min); setField('salaryMaxLpa', max); }} />
        </div>
      </div>
    </>
  );
}
