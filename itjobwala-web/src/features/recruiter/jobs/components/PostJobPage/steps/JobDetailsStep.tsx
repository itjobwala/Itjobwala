'use client';

import type { FormEvent } from 'react';
import { PRIMARY } from '@/src/lib/constants';
import type { JobForm, JobErrors } from '../../../schemas/postJob.schema';
import JobFieldsDetail from '../JobFieldsDetail';

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
  loading: boolean;
  apiError: string;
  onBack: () => void;
  onSubmit: (e: FormEvent) => void;
}

export default function JobDetailsStep({
  form, errors, setField,
  skillInput, setSkillInput, skillError, setSkillError,
  skillSuggestions, addSkill, removeSkill,
  loading, apiError, onBack, onSubmit,
}: Props) {
  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
      <JobFieldsDetail
        form={form} errors={errors} setField={setField}
        skillInput={skillInput} setSkillInput={setSkillInput}
        skillError={skillError} setSkillError={setSkillError}
        skillSuggestions={skillSuggestions}
        addSkill={addSkill} removeSkill={removeSkill}
      />

      {apiError && (
        <div className="rounded-xl px-4 py-3 text-sm font-medium text-danger bg-danger-bg border border-danger">
          {apiError}
        </div>
      )}

      <div className="flex gap-3 pt-1">
        <button type="button" onClick={onBack}
          className="flex-1 bg-surface font-semibold text-base rounded-xl transition-all duration-200"
          style={{ color: 'var(--color-body)', border: '1.5px solid var(--color-border)', padding: 13 }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = PRIMARY; e.currentTarget.style.color = PRIMARY; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.color = 'var(--color-body)'; }}>
          ← Back
        </button>
        <button type="submit" disabled={loading}
          className="flex-[2] flex items-center justify-center gap-2.5 text-white border-none rounded-xl font-bold text-md transition-all duration-200"
          style={{
            padding: 14,
            cursor: loading ? 'not-allowed' : 'pointer',
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
  );
}
