'use client';

import type { FormEvent } from 'react';
import { PRIMARY } from '@/src/lib/constants';
import type { JobForm, JobErrors } from '../../../schemas/postJob.schema';
import JobFieldsBasic from '../JobFieldsBasic';

interface Props {
  form: JobForm;
  errors: JobErrors;
  setField: (k: keyof JobForm, v: any) => void;
  onBack: () => void;
  onSubmit: (e: FormEvent) => void;
}

export default function JobBasicsStep({ form, errors, setField, onBack, onSubmit }: Props) {
  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
      <JobFieldsBasic form={form} errors={errors} setField={setField} />

      <div className="flex gap-3 pt-1">
        <button type="button" onClick={onBack}
          className="flex-1 bg-surface font-semibold text-base rounded-xl transition-all duration-200"
          style={{ color: 'var(--color-body)', border: '1.5px solid var(--color-border)', padding: 13 }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = PRIMARY; e.currentTarget.style.color = PRIMARY; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.color = 'var(--color-body)'; }}>
          ← Back
        </button>
        <button type="submit"
          className="flex-[2] flex items-center justify-center gap-2.5 text-white border-none rounded-xl font-bold text-md transition-all duration-200"
          style={{ padding: 14, cursor: 'pointer', background: PRIMARY, boxShadow: `0 4px 18px ${PRIMARY}44` }}
          onMouseEnter={e => { e.currentTarget.style.background = '#0d3fd4'; }}
          onMouseLeave={e => { e.currentTarget.style.background = PRIMARY; }}>
          Continue →
        </button>
      </div>
    </form>
  );
}
