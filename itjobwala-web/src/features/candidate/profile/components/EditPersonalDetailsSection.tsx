'use client';

import { useState } from 'react';

export interface EditableLanguage {
  id:           string;
  name:         string;
  proficiency:  string;
  read:         boolean;
  write:        boolean;
  speak:        boolean;
}

export interface EditablePersonalDetails {
  gender: string;
  marital_status: string;
  date_of_birth: string;
  category: string;
  authorized_to_work_in_us: boolean;
  work_permit_other_countries: boolean;
  address: string;
  languages: EditableLanguage[];
}

interface Props {
  profile: EditablePersonalDetails;
  onChange: (profile: EditablePersonalDetails) => void;
}

/* ── Constraints ──────────────────────────────────────────────── */
const MAX_ADDRESS = 300;
const MAX_LANG_NAME = 50;
const MIN_AGE = 16;

/* ── Per-field validator ──────────────────────────────────────── */
function validateField(key: string, value: string): string {
  switch (key) {
    case 'gender':
      return value?.trim() ? '' : 'Gender is required.';
    case 'marital_status':
      return value?.trim() ? '' : 'Marital status is required.';
    case 'date_of_birth': {
      if (!value?.trim()) return 'Date of birth is required.';
      const dob = new Date(value);
      const today = new Date();
      if (dob > today) return 'Date of birth cannot be in the future.';
      const age = today.getFullYear() - dob.getFullYear() -
        (today < new Date(today.getFullYear(), dob.getMonth(), dob.getDate()) ? 1 : 0);
      if (age < MIN_AGE) return `Must be at least ${MIN_AGE} years old.`;
      if (age > 100) return 'Please enter a valid date of birth.';
      return '';
    }
    case 'address': {
      const v = value?.trim() ?? '';
      if (!v) return 'Address is required.';
      if (v.length < 5) return 'Address must be at least 5 characters.';
      if (v.length > MAX_ADDRESS) return `Max ${MAX_ADDRESS} characters.`;
      return '';
    }
    default:
      return '';
  }
}

function validateLangName(name: string): string {
  const v = name?.trim() ?? '';
  if (!v) return 'Language name is required.';
  if (!/[a-zA-Z]/.test(v)) return 'Must contain letters (e.g. English).';
  if (v.length > MAX_LANG_NAME) return `Max ${MAX_LANG_NAME} characters.`;
  return '';
}

function validateLangProficiency(proficiency: string): string {
  return proficiency?.trim() ? '' : 'Proficiency is required.';
}

/* ── UI primitives ────────────────────────────────────────────── */
function RequiredSelect({ label, value, onChange, onBlur, children, error }: {
  label: string; value: string; onChange: (v: string) => void; onBlur?: () => void;
  children: React.ReactNode; error?: string;
}) {
  return (
    <label className="block">
      <span className="block text-caption font-bold text-muted mb-1.5">
        {label}<span className="text-danger ml-0.5">*</span>
      </span>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        onBlur={onBlur}
        aria-invalid={!!error}
        className={`w-full rounded-xl border bg-surface px-3.5 py-2.5 text-sm font-medium text-heading outline-none transition-colors focus:border-primary/50 ${error ? 'border-danger' : 'border-token'}`}
      >
        {children}
      </select>
      {error && <p className="mt-1 text-micro font-semibold text-danger">{error}</p>}
    </label>
  );
}

function TextField({ label, value, onChange, onBlur, placeholder = '', type = 'text', error, max, required }: {
  label: string; value: string; onChange: (value: string) => void; onBlur?: () => void;
  placeholder?: string; type?: string; error?: string; max?: string; required?: boolean;
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
        max={max}
        aria-invalid={!!error}
        className={`w-full rounded-xl border bg-surface px-3.5 py-2.5 text-sm font-medium text-heading outline-none transition-colors focus:border-primary/50 placeholder:text-muted ${error ? 'border-danger focus:border-danger' : 'border-token'}`}
      />
      {error && <p className="mt-1 text-micro font-semibold text-danger">{error}</p>}
    </label>
  );
}

function Checkbox({ label, checked, onChange }: { label: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <input
        type="checkbox"
        checked={checked ?? false}
        onChange={e => onChange(e.target.checked)}
        className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary/50 cursor-pointer"
      />
      <span className="text-caption font-medium text-heading">{label}</span>
    </label>
  );
}

export default function EditPersonalDetailsSection({ profile, onChange }: Props) {
  const [errors, setErrors]   = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Set<string>>(new Set());

  function touch(key: string) { setTouched(prev => new Set(prev).add(key)); }

  function setErr(key: string, msg: string) {
    setErrors(prev => msg ? { ...prev, [key]: msg } : (({ [key]: _, ...rest }) => rest)(prev));
  }

  function update(key: keyof EditablePersonalDetails, value: any) {
    onChange({ ...profile, [key]: value });
    if (touched.has(key)) {
      const msg = validateField(key, String(value ?? ''));
      setErr(key, msg);
    } else if (errors[key]) {
      setErr(key, '');
    }
  }

  function handleBlur(key: string) {
    touch(key);
    setErr(key, validateField(key, String((profile as any)[key] ?? '')));
  }

  /* Language helpers */
  function addLanguage() {
    update('languages', [...profile.languages, { id: `lang-${Date.now()}`, name: '', proficiency: '', read: false, write: false, speak: false }]);
  }

  function updateLanguage(id: string, patch: Partial<EditableLanguage>) {
    const updated = profile.languages.map(lang => lang.id === id ? { ...lang, ...patch } : lang);
    onChange({ ...profile, languages: updated });

    if ('name' in patch) {
      const nk = `lang_name_${id}`;
      if (touched.has(nk)) setErr(nk, validateLangName(patch.name ?? ''));
      else if (errors[nk]) setErr(nk, '');
    }
    if ('proficiency' in patch) {
      const pk = `lang_prof_${id}`;
      if (touched.has(pk)) setErr(pk, validateLangProficiency(patch.proficiency ?? ''));
      else if (errors[pk]) setErr(pk, '');
    }
  }

  function removeLanguage(id: string) {
    onChange({ ...profile, languages: profile.languages.filter(l => l.id !== id) });
    setErrors(prev => {
      const c = { ...prev };
      delete c[`lang_name_${id}`];
      delete c[`lang_prof_${id}`];
      return c;
    });
  }

  function handleLangBlur(id: string, field: 'name' | 'proficiency') {
    const lang = profile.languages.find(l => l.id === id);
    if (!lang) return;
    if (field === 'name') {
      touch(`lang_name_${id}`);
      setErr(`lang_name_${id}`, validateLangName(lang.name));
    } else {
      touch(`lang_prof_${id}`);
      setErr(`lang_prof_${id}`, validateLangProficiency(lang.proficiency));
    }
  }

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">

        <RequiredSelect
          label="Gender" value={profile.gender}
          onChange={v => update('gender', v)}
          onBlur={() => handleBlur('gender')}
          error={errors.gender}
        >
          <option value="">Select gender</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Transgender">Transgender</option>
          <option value="Rather not say">Rather not say</option>
        </RequiredSelect>

        <RequiredSelect
          label="Marital status" value={profile.marital_status}
          onChange={v => update('marital_status', v)}
          onBlur={() => handleBlur('marital_status')}
          error={errors.marital_status}
        >
          <option value="">Select status</option>
          <option value="Single / unmarried">Single / unmarried</option>
          <option value="Married">Married</option>
          <option value="Other">Other</option>
        </RequiredSelect>

        <TextField
          label="Date of birth" value={profile.date_of_birth}
          onChange={v => update('date_of_birth', v)}
          onBlur={() => handleBlur('date_of_birth')}
          type="date" max={todayStr} required
          error={errors.date_of_birth}
        />

        <label className="block">
          <span className="block text-caption font-bold text-muted mb-1.5">
            Category <span className="text-subtle normal-case font-normal">(optional)</span>
          </span>
          <select
            value={profile.category}
            onChange={e => update('category', e.target.value)}
            className="w-full rounded-xl border border-token bg-surface px-3.5 py-2.5 text-sm font-medium text-heading outline-none transition-colors focus:border-primary/50"
          >
            <option value="">Select category</option>
            <option value="General">General</option>
            <option value="OBC">OBC</option>
            <option value="SC">SC</option>
            <option value="ST">ST</option>
            <option value="Other">Other</option>
          </select>
        </label>

        <div className="sm:col-span-2 space-y-3">
          <span className="block text-caption font-bold text-muted">Work permit <span className="text-subtle normal-case font-normal">(optional)</span></span>
          {([
            { label: 'Authorized to work in US', key: 'authorized_to_work_in_us' as const },
            { label: 'Work permit for other countries', key: 'work_permit_other_countries' as const },
          ]).map(({ label, key }) => (
            <div key={key} className="flex items-center justify-between rounded-xl border border-token bg-surface-alt px-4 py-3">
              <span className="text-sm font-medium text-heading">{label}</span>
              <div className="flex bg-surface rounded-lg p-1 border border-token">
                <button type="button" onClick={() => update(key, true)}
                  className={`px-4 py-1.5 rounded-md text-micro font-bold transition-all ${profile[key] ? 'bg-primary text-white shadow-sm' : 'text-subtle hover:text-muted'}`}>
                  Yes
                </button>
                <button type="button" onClick={() => update(key, false)}
                  className={`px-4 py-1.5 rounded-md text-micro font-bold transition-all ${!profile[key] ? 'bg-danger text-white shadow-sm' : 'text-subtle hover:text-muted'}`}>
                  No
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="sm:col-span-2">
          <label className="block">
            <span className="block text-caption font-bold text-muted mb-1.5">
              Permanent address<span className="text-danger ml-0.5">*</span>
            </span>
            <textarea
              value={profile.address}
              onChange={e => update('address', e.target.value)}
              onBlur={() => handleBlur('address')}
              maxLength={MAX_ADDRESS}
              rows={2}
              placeholder="e.g. H.No 5493, Sector 12, New Delhi – 110001"
              aria-invalid={!!errors.address}
              className={`w-full resize-none rounded-xl border bg-surface px-3.5 py-2.5 text-sm font-medium text-heading outline-none transition-colors placeholder:text-muted ${errors.address ? 'border-danger focus:border-danger' : 'border-token focus:border-primary/50'}`}
            />
            <div className="flex items-center justify-between mt-1">
              {errors.address ? <p className="text-micro font-semibold text-danger">{errors.address}</p> : <span />}
              <span className="text-[10px] text-subtle tabular-nums">{(profile.address || '').length}/{MAX_ADDRESS}</span>
            </div>
          </label>
        </div>
      </div>

      {/* ── Languages ─────────────────────────────────────────────── */}
      <div className="border-t border-token pt-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-extrabold text-heading">
            Languages<span className="text-danger ml-0.5">*</span>
          </h3>
          <button
            type="button"
            onClick={addLanguage}
            className="flex items-center gap-1.5 text-caption font-semibold text-subtle hover:text-primary transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="12" cy="12" r="10" /><path d="M12 8v8M8 12h8" />
            </svg>
            Add language
          </button>
        </div>

        <div className="flex flex-col gap-4">
          {profile.languages.map(lang => (
            <div key={lang.id} className="rounded-2xl border border-token bg-surface-alt p-4 relative group">
              <button
                type="button"
                onClick={() => removeLanguage(lang.id)}
                className="absolute right-4 top-4 text-subtle hover:text-danger transition-colors"
                aria-label="Remove language"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
              </button>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pr-8">
                <div>
                  <label className="block">
                    <span className="block text-caption font-bold text-muted mb-1.5">
                      Language<span className="text-danger ml-0.5">*</span>
                    </span>
                    <input
                      type="text"
                      value={lang.name}
                      onChange={e => updateLanguage(lang.id, { name: e.target.value })}
                      onBlur={() => handleLangBlur(lang.id, 'name')}
                      placeholder="e.g. English"
                      maxLength={MAX_LANG_NAME}
                      aria-invalid={!!errors[`lang_name_${lang.id}`]}
                      className={`w-full rounded-xl border bg-surface px-3.5 py-2.5 text-sm font-medium text-heading outline-none transition-colors focus:border-primary/50 placeholder:text-muted ${errors[`lang_name_${lang.id}`] ? 'border-danger focus:border-danger' : 'border-token'}`}
                    />
                    {errors[`lang_name_${lang.id}`] && (
                      <p className="mt-1 text-micro font-semibold text-danger">{errors[`lang_name_${lang.id}`]}</p>
                    )}
                  </label>
                </div>

                <div>
                  <label className="block">
                    <span className="block text-caption font-bold text-muted mb-1.5">
                      Proficiency<span className="text-danger ml-0.5">*</span>
                    </span>
                    <select
                      value={lang.proficiency}
                      onChange={e => updateLanguage(lang.id, { proficiency: e.target.value })}
                      onBlur={() => handleLangBlur(lang.id, 'proficiency')}
                      aria-invalid={!!errors[`lang_prof_${lang.id}`]}
                      className={`w-full rounded-xl border bg-surface px-3.5 py-2.5 text-sm font-medium text-heading outline-none transition-colors focus:border-primary/50 ${errors[`lang_prof_${lang.id}`] ? 'border-danger' : 'border-token'}`}
                    >
                      <option value="">Select proficiency</option>
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="fluent">Fluent</option>
                    </select>
                    {errors[`lang_prof_${lang.id}`] && (
                      <p className="mt-1 text-micro font-semibold text-danger">{errors[`lang_prof_${lang.id}`]}</p>
                    )}
                  </label>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-5">
                <span className="text-caption font-bold text-muted">Skills:</span>
                <Checkbox label="Read"  checked={lang.read}  onChange={c => updateLanguage(lang.id, { read: c })} />
                <Checkbox label="Write" checked={lang.write} onChange={c => updateLanguage(lang.id, { write: c })} />
                <Checkbox label="Speak" checked={lang.speak} onChange={c => updateLanguage(lang.id, { speak: c })} />
              </div>
            </div>
          ))}
          {profile.languages.length === 0 && (
            <p className="text-caption text-subtle font-medium text-center py-4">No languages added yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
