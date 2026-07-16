'use client';

import { useState } from 'react';

export interface EditableCareerProfile {
  current_industry: string;
  department: string;
  role_category: string;
  job_role: string;
  desired_job_type: string;
  desired_employment_type: string;
  preferred_shift: string;
  preferred_work_location: string;
  expected_salary: string;
}

interface Props {
  profile: EditableCareerProfile;
  onChange: (profile: EditableCareerProfile) => void;
}

/* ── Constraints ──────────────────────────────────────────────── */
const MAX = {
  current_industry: 100,
  department:       100,
  role_category:    100,
  job_role:         100,
} as const;

const SALARY_MAX = 100_000_000;

/* ── Per-field validator ──────────────────────────────────────── */
function validate(key: string, value: string): string {
  switch (key) {
    case 'current_industry': {
      const v = value?.trim() ?? '';
      if (!v) return 'Current industry is required.';
      if (!/[a-zA-Z]/.test(v)) return 'Must contain letters (e.g. IT Services, Banking).';
      if (v.length > MAX.current_industry) return `Max ${MAX.current_industry} characters.`;
      return '';
    }
    case 'department': {
      const v = value?.trim() ?? '';
      if (!v) return 'Department is required.';
      if (!/[a-zA-Z]/.test(v)) return 'Must contain letters (e.g. Engineering, Sales).';
      if (v.length > MAX.department) return `Max ${MAX.department} characters.`;
      return '';
    }
    case 'role_category': {
      const v = value?.trim() ?? '';
      if (!v) return 'Role category is required.';
      if (!/[a-zA-Z]/.test(v)) return 'Must contain letters (e.g. Software Development).';
      if (v.length > MAX.role_category) return `Max ${MAX.role_category} characters.`;
      return '';
    }
    case 'job_role': {
      const v = value?.trim() ?? '';
      if (!v) return 'Job role is required.';
      if (!/[a-zA-Z]/.test(v)) return 'Must contain letters (e.g. Software Developer).';
      if (v.length > MAX.job_role) return `Max ${MAX.job_role} characters.`;
      return '';
    }
    case 'expected_salary': {
      if (value === '' || value == null) return '';
      const n = Number(value);
      if (isNaN(n) || n <= 0) return 'Expected salary must be greater than 0.';
      if (n > SALARY_MAX) return 'Enter a realistic salary (max ₹10 crore).';
      return '';
    }
    default:
      return '';
  }
}

function TextField({ label, value, onChange, onBlur, placeholder = '', type = 'text', error = '', required, maxLength }: {
  label: string; value: string; onChange: (value: string) => void; onBlur?: () => void;
  placeholder?: string; type?: string; error?: string; required?: boolean; maxLength?: number;
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
        placeholder={placeholder}
        maxLength={maxLength}
        aria-invalid={!!error}
        className={`w-full rounded-xl border bg-surface px-3.5 py-2.5 text-sm font-medium text-heading outline-none transition-colors focus:border-primary/50 placeholder:text-muted ${error ? 'border-danger' : 'border-token'}`}
      />
      {error && <p className="text-micro text-danger mt-1 font-medium">{error}</p>}
    </label>
  );
}

function SelectField({ label, value, onChange, options, required, error }: {
  label: string; value: string | string[]; onChange: (value: string) => void; options: string[];
  required?: boolean; error?: string;
}) {
  const rawValue = typeof value === 'string' ? value : (Array.isArray(value) ? value[0] || '' : '');
  const scalarValue = (rawValue && typeof rawValue === 'string' ? rawValue.trim() : '') || '';
  return (
    <label className="block">
      <span className="block text-caption font-bold text-muted mb-1.5">
        {label}{required && <span className="text-danger ml-0.5">*</span>}
      </span>
      <select
        value={scalarValue}
        onChange={e => onChange(e.target.value)}
        aria-invalid={!!error}
        className={`w-full rounded-xl border bg-surface px-3.5 py-2.5 text-sm font-medium text-heading outline-none transition-colors focus:border-primary/50 ${error ? 'border-danger' : 'border-token'}`}
      >
        <option value="">-- Select --</option>
        {options.map(option => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
      {error && <p className="text-micro text-danger mt-1 font-medium">{error}</p>}
    </label>
  );
}

export default function EditCareerProfileSection({ profile, onChange }: Props) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Set<string>>(new Set());

  function update(key: keyof EditableCareerProfile, value: string) {
    onChange({ ...profile, [key]: value });
    // Live-clear errors while typing if already touched
    if (touched.has(key)) {
      const msg = validate(key, value);
      setErrors(prev => {
        if (msg) return { ...prev, [key]: msg };
        const copy = { ...prev };
        delete copy[key];
        return copy;
      });
    } else if (errors[key]) {
      setErrors(prev => { const c = { ...prev }; delete c[key]; return c; });
    }
  }

  function handleBlur(key: string) {
    setTouched(prev => new Set(prev).add(key));
    const msg = validate(key, (profile as any)[key] ?? '');
    setErrors(prev => {
      if (msg) return { ...prev, [key]: msg };
      const copy = { ...prev };
      delete copy[key];
      return copy;
    });
  }

  return (
    <div className="flex flex-col gap-3.5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <TextField label="Current industry" value={profile.current_industry} onChange={v => update('current_industry', v)} onBlur={() => handleBlur('current_industry')} placeholder="e.g. IT Services & Consulting" required maxLength={MAX.current_industry} error={errors.current_industry} />
        <TextField label="Department" value={profile.department} onChange={v => update('department', v)} onBlur={() => handleBlur('department')} placeholder="e.g. Engineering - Software & QA" required maxLength={MAX.department} error={errors.department} />
        <TextField label="Role category" value={profile.role_category} onChange={v => update('role_category', v)} onBlur={() => handleBlur('role_category')} placeholder="e.g. Software Development" required maxLength={MAX.role_category} error={errors.role_category} />
        <TextField label="Job role" value={profile.job_role} onChange={v => update('job_role', v)} onBlur={() => handleBlur('job_role')} placeholder="e.g. Software Development - Other" required maxLength={MAX.job_role} error={errors.job_role} />
        <SelectField label="Desired job type (optional)" value={profile.desired_job_type} onChange={v => update('desired_job_type', v)} options={['Full-time', 'Part-time', 'Contract', 'Internship', 'Freelance']} />
        <SelectField label="Desired employment type (optional)" value={profile.desired_employment_type} onChange={v => update('desired_employment_type', v)} options={['Permanent', 'Temporary', 'Contractual']} />
        <SelectField label="Preferred shift (optional)" value={profile.preferred_shift} onChange={v => update('preferred_shift', v)} options={['Day Shift', 'Night Shift', 'Flexible']} />
        <label className="block">
          <span className="block text-caption font-bold text-muted mb-1.5">Expected salary — ₹ <span className="text-subtle normal-case font-normal">(optional)</span></span>
          <input
            type="number"
            min="1"
            max="100000000"
            value={profile.expected_salary}
            onChange={e => update('expected_salary', e.target.value)}
            onBlur={() => handleBlur('expected_salary')}
            placeholder="e.g. 100000"
            aria-invalid={!!errors.expected_salary}
            className={`w-full rounded-xl border bg-surface px-3.5 py-2.5 text-sm font-medium text-heading outline-none transition-colors placeholder:text-muted ${
              errors.expected_salary ? 'border-danger focus:border-danger' : 'border-token focus:border-primary/50'
            }`}
          />
          {errors.expected_salary && (
            <span className="mt-1 block text-micro font-semibold text-danger">{errors.expected_salary}</span>
          )}
        </label>
      </div>
      <SelectField label="Preferred work location (optional)" value={profile.preferred_work_location} onChange={v => update('preferred_work_location', v)} options={['Remote', 'On-site', 'Hybrid']} />
    </div>
  );
}

