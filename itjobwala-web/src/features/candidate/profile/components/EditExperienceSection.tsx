'use client';

import { useState } from 'react';
import DateInput from '@/src/components/ui/DateInput';
import { formatDateForInput } from '../utils/profileDate';

export interface EditableExperience {
  id: string;
  company: string;
  role: string;
  title?: string;
  employment_type: string;
  location?: string;
  start_date: string;
  end_date: string;
  is_current: boolean;
  description: string;
  skills: string[];
}

interface Props {
  experiences: EditableExperience[];
  onChange: (experiences: EditableExperience[]) => void;
  onDelete?: (id: string | number) => void;
}

/* ── Constraints ──────────────────────────────────────────────── */
const MAX = {
  company:     100,
  role:        100,
  location:    100,
  description: 2000,
} as const;

/* ── Per-field validator ──────────────────────────────────────── */
function validate(key: string, value: string, exp?: EditableExperience): string {
  switch (key) {
    case 'company': {
      const v = value?.trim() ?? '';
      if (!v) return 'Company name is required.';
      if (!/[a-zA-Z]/.test(v)) return 'Company name must contain letters (e.g. Google, Infosys).';
      if (v.length > MAX.company) return `Max ${MAX.company} characters.`;
      return '';
    }
    case 'role': {
      const v = value?.trim() ?? '';
      if (!v) return 'Role is required.';
      if (!/[a-zA-Z]/.test(v)) return 'Role must contain letters (e.g. Software Engineer).';
      if (v.length > MAX.role) return `Max ${MAX.role} characters.`;
      return '';
    }
    case 'location': {
      const v = value?.trim() ?? '';
      if (v && !/[a-zA-Z]/.test(v)) return 'Location must contain letters (e.g. Bangalore, Remote).';
      if (v && v.length > MAX.location) return `Max ${MAX.location} characters.`;
      return '';
    }
    case 'start_date': {
      if (!value) return 'Start date is required.';
      return '';
    }
    case 'end_date': {
      if (exp && !exp.is_current && !value) return 'End date is required.';
      if (exp && value && exp.start_date && new Date(exp.start_date) > new Date(value))
        return 'End date must be after start date.';
      return '';
    }
    case 'description': {
      const v = value?.trim() ?? '';
      if (v && v.length > MAX.description) return `Max ${MAX.description} characters.`;
      return '';
    }
    default:
      return '';
  }
}

function emptyExperience(): EditableExperience {
  return {
    id: `exp-${Date.now()}`,
    company: '',
    role: '',
    employment_type: 'Full-time',
    location: '',
    start_date: '',
    end_date: '',
    is_current: false,
    description: '',
    skills: [],
  };
}

function TextField({
  label,
  value,
  onChange,
  onBlur,
  type = 'text',
  disabled = false,
  placeholder = '',
  required,
  error,
  maxLength,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  type?: string;
  disabled?: boolean;
  placeholder?: string;
  required?: boolean;
  error?: string;
  maxLength?: number;
}) {
  return (
    <label className="block">
      <span className="block text-caption font-bold text-muted mb-1.5">
        {label}{required && <span className="text-danger ml-0.5">*</span>}
      </span>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        onBlur={onBlur}
        disabled={disabled}
        placeholder={placeholder}
        maxLength={maxLength}
        aria-invalid={!!error}
        className={`w-full rounded-xl border bg-surface px-3.5 py-2.5 text-sm font-medium outline-none transition-colors placeholder:text-subtle ${
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


function SkillInput({ skills, onChange }: { skills: string[], onChange: (skills: string[]) => void }) {
  const [input, setInput] = useState('');
  function addSkill(skill: string) {
    const trimmed = skill.trim();
    if (!trimmed || skills.includes(trimmed)) return;
    onChange([...skills, trimmed]);
    setInput('');
  }
  return (
    <div className="block mt-3">
      <span className="block text-caption font-bold text-muted mb-1.5">Skills used</span>
      {skills.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {skills.map(skill => (
            <span key={skill} className="group flex items-center gap-1.5 bg-primary/10 text-primary rounded-xl px-2.5 py-1.5 border border-primary/20">
              <span className="text-caption font-semibold">{skill}</span>
              <button
                type="button"
                onClick={() => onChange(skills.filter(s => s !== skill))}
                className="text-primary/60 hover:text-primary transition-colors"
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </span>
          ))}
        </div>
      )}
      <input
        type="text"
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={e => {
          if (e.key === 'Enter') {
            e.preventDefault();
            addSkill(input);
          }
        }}
        placeholder="Add skill and press Enter"
        className="w-full rounded-xl border border-token bg-surface px-3.5 py-2.5 text-sm font-medium text-heading outline-none transition-colors focus:border-primary/50 placeholder:text-subtle"
      />
    </div>
  );
}

export default function EditExperienceSection({ experiences, onChange, onDelete }: Props) {
  // Track errors and touched state per experience per field: "expId::field"
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Set<string>>(new Set());

  function errKey(expId: string, field: string) { return `${expId}::${field}`; }

  function update(id: string, patch: Partial<EditableExperience>) {
    const updated = experiences.map(item => (item.id === id ? { ...item, ...patch } : item));
    onChange(updated);

    // Live-validate touched fields
    const exp = updated.find(e => e.id === id);
    if (!exp) return;
    for (const [key, val] of Object.entries(patch)) {
      const ek = errKey(id, key);
      if (touched.has(ek)) {
        const msg = validate(key, String(val ?? ''), exp);
        setErrors(prev => {
          if (msg) return { ...prev, [ek]: msg };
          const c = { ...prev }; delete c[ek]; return c;
        });
      } else if (errors[ek]) {
        setErrors(prev => { const c = { ...prev }; delete c[ek]; return c; });
      }
    }
  }

  function handleBlur(expId: string, field: string) {
    const ek = errKey(expId, field);
    setTouched(prev => new Set(prev).add(ek));
    const exp = experiences.find(e => e.id === expId);
    if (!exp) return;
    const msg = validate(field, String((exp as any)[field] ?? ''), exp);
    setErrors(prev => {
      if (msg) return { ...prev, [ek]: msg };
      const c = { ...prev }; delete c[ek]; return c;
    });
  }

  function getErr(expId: string, field: string): string | undefined {
    return errors[errKey(expId, field)] || undefined;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => onChange([...experiences, emptyExperience()])}
          className="flex items-center gap-1.5 text-caption font-semibold text-subtle hover:text-primary transition-colors"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="12" cy="12" r="10" /><path d="M12 8v8M8 12h8" />
          </svg>
          Add experience
        </button>
      </div>

      <div className="flex flex-col gap-4">
        {experiences.map(exp => {
          return (
          <div key={exp.id} className="rounded-2xl border border-token bg-surface-alt p-4 hover:border-primary/20 transition-colors">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <TextField label="Company" value={exp.company} onChange={value => update(exp.id, { company: value })} onBlur={() => handleBlur(exp.id, 'company')} placeholder="e.g. Google" required maxLength={MAX.company} error={getErr(exp.id, 'company')} />
              <TextField label="Role" value={exp.role} onChange={value => update(exp.id, { role: value })} onBlur={() => handleBlur(exp.id, 'role')} placeholder="e.g. Senior Software Engineer" required maxLength={MAX.role} error={getErr(exp.id, 'role')} />
              <label className="block">
                <span className="block text-caption font-bold text-muted mb-1.5">Employment type<span className="text-danger ml-0.5">*</span></span>
                <select
                  value={exp.employment_type}
                  onChange={e => update(exp.id, { employment_type: e.target.value })}
                  className="w-full rounded-xl border border-token bg-surface px-3.5 py-2.5 text-sm font-medium text-heading outline-none transition-colors focus:border-primary/50"
                >
                  <option>Full-time</option>
                  <option>Part-time</option>
                  <option>Contract</option>
                  <option>Internship</option>
                </select>
              </label>
              <TextField label="Location" value={exp.location || ''} onChange={value => update(exp.id, { location: value })} onBlur={() => handleBlur(exp.id, 'location')} placeholder="e.g. Bengaluru, India" maxLength={MAX.location} error={getErr(exp.id, 'location')} />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <DateInput label="Start date" value={formatDateForInput(exp.start_date)} onChange={value => { update(exp.id, { start_date: value }); setTimeout(() => handleBlur(exp.id, 'start_date'), 0); }} />
                  {getErr(exp.id, 'start_date') && <p className="mt-1 text-micro font-semibold text-danger">{getErr(exp.id, 'start_date')}</p>}
                </div>
                <div>
                  <DateInput label="End date" value={formatDateForInput(exp.end_date)} onChange={value => { update(exp.id, { end_date: value }); setTimeout(() => handleBlur(exp.id, 'end_date'), 0); }} disabled={exp.is_current} />
                  {getErr(exp.id, 'end_date') && <p className="mt-1 text-micro font-semibold text-danger">{getErr(exp.id, 'end_date')}</p>}
                </div>
              </div>
            </div>

            <label className="mt-3 flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={exp.is_current ?? false}
                onChange={e => {
                  update(exp.id, { is_current: e.target.checked, end_date: e.target.checked ? '' : exp.end_date });
                  // Clear end_date error when toggling "currently work here"
                  if (e.target.checked) {
                    const ek = errKey(exp.id, 'end_date');
                    setErrors(prev => { const c = { ...prev }; delete c[ek]; return c; });
                  }
                }}
                className="h-4 w-4 rounded border-gray-300 text-primary accent-primary"
              />
              <span className="text-sm font-semibold text-body-secondary">I currently work here</span>
            </label>

            <label className="block mt-3">
              <span className="block text-caption font-bold text-muted mb-1.5">Description</span>
              <textarea
                value={exp.description}
                onChange={e => update(exp.id, { description: e.target.value })}
                onBlur={() => handleBlur(exp.id, 'description')}
                maxLength={MAX.description}
                rows={4}
                aria-invalid={!!getErr(exp.id, 'description')}
                className={`w-full resize-none rounded-xl border bg-surface px-3.5 py-2.5 text-sm leading-[1.7] text-body outline-none transition-colors focus:border-primary/50 placeholder:text-subtle ${getErr(exp.id, 'description') ? 'border-danger' : 'border-token'}`}
              />
              {getErr(exp.id, 'description') && <p className="mt-1 text-micro font-semibold text-danger">{getErr(exp.id, 'description')}</p>}
            </label>

            <SkillInput skills={exp.skills || []} onChange={skills => update(exp.id, { skills })} />

            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={() => onDelete ? onDelete(exp.id) : onChange(experiences.filter(item => item.id !== exp.id))}
                className="text-caption font-semibold text-danger transition-colors"
              >
                Remove experience
              </button>
            </div>
          </div>
          );
        })}
      </div>
    </div>
  );
}

