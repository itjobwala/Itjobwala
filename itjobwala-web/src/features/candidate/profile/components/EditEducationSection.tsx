'use client';

import { useState } from 'react';
import DateInput from '@/src/components/ui/DateInput';
import { formatDateForInput } from '../utils/profileDate';

export interface EditableEducation {
  id: string;
  institution: string;
  degree: string;
  field_of_study: string;
  location?: string;
  start_date: string;
  end_date: string;
  grade: string;
  is_current: boolean;
}

interface Props {
  education: EditableEducation[];
  onChange: (education: EditableEducation[]) => void;
  onDelete?: (id: string | number) => void;
}

/* ── Constraints ──────────────────────────────────────────────── */
const MAX = {
  institution:    150,
  degree:         100,
  field_of_study: 100,
  location:       100,
  grade:           20,
} as const;

/* ── Per-field validator ──────────────────────────────────────── */
function validateField(key: string, value: string, edu?: EditableEducation): string {
  switch (key) {
    case 'institution': {
      const v = value?.trim() ?? '';
      if (!v) return 'Institution is required.';
      if (!/[a-zA-Z]/.test(v)) return 'Must contain letters (e.g. Stanford University).';
      if (v.length > MAX.institution) return `Max ${MAX.institution} characters.`;
      return '';
    }
    case 'degree': {
      const v = value?.trim() ?? '';
      if (!v) return 'Degree is required.';
      if (!/[a-zA-Z]/.test(v)) return 'Must contain letters (e.g. Bachelor of Science).';
      if (v.length > MAX.degree) return `Max ${MAX.degree} characters.`;
      return '';
    }
    case 'field_of_study': {
      const v = value?.trim() ?? '';
      if (!v) return 'Field of study is required.';
      if (!/[a-zA-Z]/.test(v)) return 'Must contain letters (e.g. Computer Science).';
      if (v.length > MAX.field_of_study) return `Max ${MAX.field_of_study} characters.`;
      return '';
    }
    case 'location': {
      const v = value?.trim() ?? '';
      if (v && !/[a-zA-Z]/.test(v)) return 'Must contain letters (e.g. San Francisco, CA).';
      if (v && v.length > MAX.location) return `Max ${MAX.location} characters.`;
      return '';
    }
    case 'grade': {
      const v = value?.trim() ?? '';
      if (v && v.length > MAX.grade) return `Max ${MAX.grade} characters.`;
      return '';
    }
    case 'start_date':
      if (!value) return 'Start date is required.';
      return '';
    case 'end_date':
      if (edu && !edu.is_current && !value) return 'End date is required.';
      if (edu && value && edu.start_date && new Date(edu.start_date) > new Date(value))
        return 'End date must be after start date.';
      return '';
    default:
      return '';
  }
}

function emptyEducation(): EditableEducation {
  return { id: `edu-${Date.now()}`, institution: '', degree: '', field_of_study: '', location: '', start_date: '', end_date: '', grade: '', is_current: false };
}

function TextField({ label, value, onChange, onBlur, placeholder = '', disabled = false, required, error, maxLength }: {
  label: string; value: string; onChange: (value: string) => void; onBlur?: () => void;
  placeholder?: string; disabled?: boolean; required?: boolean; error?: string; maxLength?: number;
}) {
  return (
    <label className="block">
      <span className="block text-caption font-bold text-muted mb-1.5">
        {label}{required && <span className="text-danger ml-0.5">*</span>}
      </span>
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        onBlur={onBlur}
        placeholder={placeholder}
        disabled={disabled}
        maxLength={maxLength}
        aria-invalid={!!error}
        className={`w-full rounded-xl border bg-surface px-3.5 py-2.5 text-sm font-medium outline-none transition-colors placeholder:text-muted ${
          disabled
            ? 'border-token bg-surface-alt text-subtle cursor-not-allowed'
            : error
              ? 'border-danger text-heading focus:border-danger'
              : 'border-token text-heading focus:border-primary/50'
        }`}
      />
      {error && <p className="mt-1 text-micro font-semibold text-danger">{error}</p>}
    </label>
  );
}

export default function EditEducationSection({ education, onChange, onDelete }: Props) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Set<string>>(new Set());

  function errKey(eduId: string, field: string) { return `${eduId}::${field}`; }

  function update(id: string, patch: Partial<EditableEducation>) {
    const updated = education.map(item => (item.id === id ? { ...item, ...patch } : item));
    onChange(updated);

    const edu = updated.find(e => e.id === id);
    if (!edu) return;
    for (const [key, val] of Object.entries(patch)) {
      const ek = errKey(id, key);
      if (touched.has(ek)) {
        const msg = validateField(key, String(val ?? ''), edu);
        setErrors(prev => {
          if (msg) return { ...prev, [ek]: msg };
          const c = { ...prev }; delete c[ek]; return c;
        });
      } else if (errors[ek]) {
        setErrors(prev => { const c = { ...prev }; delete c[ek]; return c; });
      }
    }
  }

  function handleBlur(eduId: string, field: string) {
    const ek = errKey(eduId, field);
    setTouched(prev => new Set(prev).add(ek));
    const edu = education.find(e => e.id === eduId);
    if (!edu) return;
    const msg = validateField(field, String((edu as any)[field] ?? ''), edu);
    setErrors(prev => {
      if (msg) return { ...prev, [ek]: msg };
      const c = { ...prev }; delete c[ek]; return c;
    });
  }

  function getErr(eduId: string, field: string) { return errors[errKey(eduId, field)] || undefined; }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => onChange([...education, emptyEducation()])}
          className="flex items-center gap-1.5 text-caption font-semibold text-subtle hover:text-primary transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="12" cy="12" r="10" /><path d="M12 8v8M8 12h8" />
          </svg>
          Add education
        </button>
      </div>

      <div className="flex flex-col gap-4">
        {education.map(item => (
          <div key={item.id} className="rounded-2xl border border-token bg-surface-alt p-4 hover:border-primary/20 transition-colors">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <TextField
                label="Institution" value={item.institution || ''} required
                onChange={v => update(item.id, { institution: v })}
                onBlur={() => handleBlur(item.id, 'institution')}
                placeholder="e.g. Stanford University"
                maxLength={MAX.institution} error={getErr(item.id, 'institution')}
              />
              <TextField
                label="Degree" value={item.degree || ''} required
                onChange={v => update(item.id, { degree: v })}
                onBlur={() => handleBlur(item.id, 'degree')}
                placeholder="e.g. Bachelor of Science"
                maxLength={MAX.degree} error={getErr(item.id, 'degree')}
              />
              <TextField
                label="Field of study" value={item.field_of_study || ''} required
                onChange={v => update(item.id, { field_of_study: v })}
                onBlur={() => handleBlur(item.id, 'field_of_study')}
                placeholder="e.g. Computer Science"
                maxLength={MAX.field_of_study} error={getErr(item.id, 'field_of_study')}
              />
              <TextField
                label="Location (optional)" value={item.location || ''}
                onChange={v => update(item.id, { location: v })}
                onBlur={() => handleBlur(item.id, 'location')}
                placeholder="e.g. San Francisco, CA"
                maxLength={MAX.location} error={getErr(item.id, 'location')}
              />
              <TextField
                label="Grade / GPA (optional)" value={item.grade || ''}
                onChange={v => update(item.id, { grade: v })}
                onBlur={() => handleBlur(item.id, 'grade')}
                placeholder="e.g. 3.8/4.0 or 85%"
                maxLength={MAX.grade} error={getErr(item.id, 'grade')}
              />
              <div className="grid grid-cols-2 gap-3 sm:col-span-2">
                <div>
                  <DateInput
                    label="Start date *"
                    value={formatDateForInput(item.start_date)}
                    onChange={v => { update(item.id, { start_date: v }); setTimeout(() => handleBlur(item.id, 'start_date'), 0); }}
                  />
                  {getErr(item.id, 'start_date') && <p className="mt-1 text-micro font-semibold text-danger">{getErr(item.id, 'start_date')}</p>}
                </div>
                <div>
                  <DateInput
                    label="End date"
                    value={formatDateForInput(item.end_date)}
                    onChange={v => { update(item.id, { end_date: v, is_current: v ? false : item.is_current }); setTimeout(() => handleBlur(item.id, 'end_date'), 0); }}
                    disabled={item.is_current}
                  />
                  {getErr(item.id, 'end_date') && <p className="mt-1 text-micro font-semibold text-danger">{getErr(item.id, 'end_date')}</p>}
                </div>
              </div>
            </div>

            <label className="mt-3 flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={item.is_current ?? false}
                onChange={e => {
                  update(item.id, { is_current: e.target.checked, end_date: e.target.checked ? '' : item.end_date });
                  if (e.target.checked) {
                    const ek = errKey(item.id, 'end_date');
                    setErrors(prev => { const c = { ...prev }; delete c[ek]; return c; });
                  }
                }}
                className="h-4 w-4 rounded border-gray-300 text-primary accent-primary"
              />
              <span className="text-sm font-semibold text-body-secondary">I am currently pursuing this</span>
            </label>

            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={() => onDelete ? onDelete(item.id) : onChange(education.filter(ed => ed.id !== item.id))}
                className="text-caption font-semibold text-danger hover:text-danger transition-colors"
              >
                Remove education
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
