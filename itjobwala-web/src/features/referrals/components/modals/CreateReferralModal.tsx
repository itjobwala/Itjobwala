'use client';

import { useState, useEffect } from 'react';
import { useCreateReferralMutation } from '../../hooks';
import { useCandidateProfileQuery } from '@/features/candidate/profile/hooks/useProfile';
import EditSkillsSection from '@/features/candidate/profile/components/EditSkillsSection';
import type { CreateReferralJobPayload } from '../../types/referral.types';

interface Props {
  isOpen:    boolean;
  onClose:   () => void;
  onSuccess: () => void;
}

const EMPTY: CreateReferralJobPayload = {
  company_name:  '',
  job_title:     '',
  location:      '',
  experience_required: '',
  salary_range:  '',
  description:   '',
  skills:        [],
  referral_reward: '',
  referral_strength: 70,
};

/* ── Field constraints ─────────────────────────────────────────── */
const MAX_LEN = {
  company_name:        100,
  job_title:           100,
  location:            100,
  experience_required:  50,
  salary_range:         50,
  referral_reward:     100,
  description:        1000,
} as const;

const DESC_MIN = 20;

/* ── Per-field validator ───────────────────────────────────────── */
function validateField(
  key: string,
  value: unknown,
  form: CreateReferralJobPayload,
): string | null {
  switch (key) {
    case 'company_name': {
      const v = (value as string)?.trim() ?? '';
      if (!v) return 'Company name is required.';
      if (v.length > MAX_LEN.company_name) return `Maximum ${MAX_LEN.company_name} characters allowed.`;
      return null;
    }
    case 'job_title': {
      const v = (value as string)?.trim() ?? '';
      if (!v) return 'Role is required.';
      if (v.length > MAX_LEN.job_title) return `Maximum ${MAX_LEN.job_title} characters allowed.`;
      return null;
    }
    case 'location': {
      const v = (value as string)?.trim() ?? '';
      if (!v) return 'Location is required.';
      if (!/[a-zA-Z]/.test(v)) return 'Location must contain letters (e.g. Bangalore, Remote).';
      if (v.length > MAX_LEN.location) return `Maximum ${MAX_LEN.location} characters allowed.`;
      return null;
    }
    case 'experience_required': {
      const v = (value as string)?.trim() ?? '';
      if (!v) return 'Experience is required.';
      if (!/^\d/.test(v)) return 'Experience must start with a number (e.g. 3-6 years, 5+).';
      if (v.length > MAX_LEN.experience_required) return `Maximum ${MAX_LEN.experience_required} characters allowed.`;
      return null;
    }
    case 'salary_range': {
      const v = (value as string)?.trim() ?? '';
      if (v && v.length > MAX_LEN.salary_range) return `Maximum ${MAX_LEN.salary_range} characters allowed.`;
      return null;
    }
    case 'referral_reward': {
      const v = (value as string)?.trim() ?? '';
      if (v && v.length > MAX_LEN.referral_reward) return `Maximum ${MAX_LEN.referral_reward} characters allowed.`;
      return null;
    }
    case 'skills': {
      const arr = value as string[] | undefined;
      if (!arr || arr.length === 0) return 'Please add at least one required skill.';
      return null;
    }
    case 'description': {
      const v = (value as string)?.trim() ?? '';
      if (!v) return 'Description is required.';
      if (v.length < DESC_MIN) return `Please enter at least ${DESC_MIN} characters.`;
      if (v.length > MAX_LEN.description) return `Maximum ${MAX_LEN.description} characters allowed.`;
      return null;
    }
    default:
      return null;
  }
}

/* ── Validate entire form ──────────────────────────────────────── */
function validateAll(form: CreateReferralJobPayload): Record<string, string> {
  const errs: Record<string, string> = {};
  const required: (keyof CreateReferralJobPayload)[] = [
    'company_name', 'job_title', 'location', 'experience_required',
    'skills', 'description',
  ];
  for (const key of required) {
    const msg = validateField(key, form[key], form);
    if (msg) errs[key] = msg;
  }
  // Also validate optional fields for max-length
  for (const key of ['salary_range', 'referral_reward'] as const) {
    const msg = validateField(key, form[key], form);
    if (msg) errs[key] = msg;
  }
  return errs;
}

export default function CreateReferralModal({ isOpen, onClose, onSuccess }: Props) {
  const [form, setForm]       = useState<CreateReferralJobPayload>(EMPTY);
  const [errors, setErrors]   = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Set<string>>(new Set());
  const createMutation = useCreateReferralMutation();

  const { data: profile } = useCandidateProfileQuery(isOpen);

  // Auto-fill company name from current experience when modal opens
  useEffect(() => {
    if (!isOpen || !profile) return;
    const currentExp = profile.experience?.find(e => e.is_current) ?? profile.experience?.[0];
    const rawCompany = currentExp?.company ?? '';
    const company = typeof rawCompany === 'string' && rawCompany.trim() && !/^\d+$/.test(rawCompany.trim())
      ? rawCompany.trim() : '';
    setForm(f => ({ ...f, company_name: f.company_name || company }));
  }, [isOpen, profile]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) { setForm(EMPTY); setErrors({}); setTouched(new Set()); }
  }, [isOpen]);

  if (!isOpen) return null;

  /* ── Helpers ─────────────────────────────────────────────────── */
  function set(key: keyof CreateReferralJobPayload, val: unknown) {
    setForm(f => ({ ...f, [key]: val }));
    // Clear error live as user types if field was touched
    if (touched.has(key)) {
      const msg = validateField(key, val, { ...form, [key]: val });
      setErrors(prev => {
        if (msg) return { ...prev, [key]: msg };
        const copy = { ...prev };
        delete copy[key];
        return copy;
      });
    } else if (errors[key]) {
      // Also clear if there was a submit-triggered error
      setErrors(prev => {
        const copy = { ...prev };
        delete copy[key];
        return copy;
      });
    }
  }

  function handleBlur(key: keyof CreateReferralJobPayload) {
    setTouched(prev => new Set(prev).add(key));
    const msg = validateField(key, form[key], form);
    setErrors(prev => {
      if (msg) return { ...prev, [key]: msg };
      const copy = { ...prev };
      delete copy[key];
      return copy;
    });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Trim all string fields before validating
    const trimmed: CreateReferralJobPayload = {
      ...form,
      company_name:        form.company_name?.trim() ?? '',
      job_title:           form.job_title?.trim() ?? '',
      location:            form.location?.trim() ?? '',
      experience_required: form.experience_required?.trim() ?? '',
      salary_range:        form.salary_range?.trim() ?? '',
      description:         form.description?.trim() ?? '',
      referral_reward:     form.referral_reward?.trim() ?? '',
    };
    setForm(trimmed);

    const newErrors = validateAll(trimmed);

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      // Mark all errored fields as touched so live validation kicks in
      setTouched(prev => {
        const next = new Set(prev);
        Object.keys(newErrors).forEach(k => next.add(k));
        return next;
      });
      return;
    }

    setErrors({});
    createMutation.mutate(trimmed, { onSuccess: () => { setForm(EMPTY); setTouched(new Set()); onSuccess(); } });
  }

  /* ── Style helpers ───────────────────────────────────────────── */
  const fieldCls = 'w-full text-sm border border-token rounded-xl px-4 py-2.5 focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/10 transition-all placeholder:text-subtle';
  const errCls   = 'border-red-500 focus:border-red-500 focus:ring-red-500/10';

  function inputClass(key: string) {
    return `${fieldCls} ${errors[key] ? errCls : ''}`;
  }

  const descLen = (form.description ?? '').trim().length;

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 overflow-y-auto">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-surface rounded-3xl shadow-2xl w-full max-w-xl my-6">
        <div className="bg-gradient-to-r from-indigo-600 to-primary px-6 py-5 text-white rounded-t-3xl">
          <h2 className="text-xl font-extrabold">Post a Referral Opportunity</h2>
          <p className="text-sm text-white/80 mt-0.5">Help someone get a referral at your company</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4" noValidate>
          {/* Row 1: Company + Role */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-micro font-bold text-body-secondary mb-1.5 uppercase tracking-wide">Company *</label>
              <input
                value={form.company_name}
                onChange={e => set('company_name', e.target.value)}
                onBlur={() => handleBlur('company_name')}
                maxLength={MAX_LEN.company_name}
                placeholder="Infosys, TCS, Google..."
                aria-invalid={!!errors.company_name}
                className={inputClass('company_name')}
              />
              {errors.company_name && <p className="text-micro text-red-500 mt-1">{errors.company_name}</p>}
            </div>
            <div>
              <label className="block text-micro font-bold text-body-secondary mb-1.5 uppercase tracking-wide">Role *</label>
              <input
                value={form.job_title}
                onChange={e => set('job_title', e.target.value)}
                onBlur={() => handleBlur('job_title')}
                maxLength={MAX_LEN.job_title}
                placeholder="Senior SDE, Product Manager..."
                aria-invalid={!!errors.job_title}
                className={inputClass('job_title')}
              />
              {errors.job_title && <p className="text-micro text-red-500 mt-1">{errors.job_title}</p>}
            </div>
          </div>

          {/* Row 2: Location + Experience */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-micro font-bold text-body-secondary mb-1.5 uppercase tracking-wide">Location *</label>
              <input
                value={form.location ?? ''}
                onChange={e => set('location', e.target.value)}
                onBlur={() => handleBlur('location')}
                maxLength={MAX_LEN.location}
                placeholder="e.g. Bangalore, Remote"
                aria-invalid={!!errors.location}
                className={inputClass('location')}
              />
              {errors.location && <p className="text-micro text-red-500 mt-1">{errors.location}</p>}
            </div>
            <div>
              <label className="block text-micro font-bold text-body-secondary mb-1.5 uppercase tracking-wide">Experience *</label>
              <input
                value={form.experience_required ?? ''}
                onChange={e => set('experience_required', e.target.value)}
                onBlur={() => handleBlur('experience_required')}
                maxLength={MAX_LEN.experience_required}
                placeholder="e.g. 3-6 years"
                aria-invalid={!!errors.experience_required}
                className={inputClass('experience_required')}
              />
              {errors.experience_required && <p className="text-micro text-red-500 mt-1">{errors.experience_required}</p>}
            </div>
          </div>

          {/* Row 3: Salary + Reward */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-micro font-bold text-body-secondary mb-1.5 uppercase tracking-wide">
                Salary Range <span className="text-subtle normal-case font-normal">(optional)</span>
              </label>
              <input
                value={form.salary_range ?? ''}
                onChange={e => set('salary_range', e.target.value)}
                onBlur={() => handleBlur('salary_range')}
                maxLength={MAX_LEN.salary_range}
                placeholder="e.g. 15-25 LPA"
                aria-invalid={!!errors.salary_range}
                className={inputClass('salary_range')}
              />
              {errors.salary_range && <p className="text-micro text-red-500 mt-1">{errors.salary_range}</p>}
            </div>
            <div>
              <label className="block text-micro font-bold text-body-secondary mb-1.5 uppercase tracking-wide">
                Referral Reward <span className="text-subtle normal-case font-normal">(optional)</span>
              </label>
              <input
                value={form.referral_reward ?? ''}
                onChange={e => set('referral_reward', e.target.value)}
                onBlur={() => handleBlur('referral_reward')}
                maxLength={MAX_LEN.referral_reward}
                placeholder="₹10,000 bonus"
                aria-invalid={!!errors.referral_reward}
                className={inputClass('referral_reward')}
              />
              {errors.referral_reward && <p className="text-micro text-red-500 mt-1">{errors.referral_reward}</p>}
            </div>
          </div>

          {/* Skills */}
          <div>
            <label className="block text-micro font-bold text-body-secondary mb-1.5 uppercase tracking-wide">Skills *</label>
            <EditSkillsSection
              skills={form.skills ?? []}
              onChange={skills => { set('skills', skills); }}
            />
            {errors.skills && (
              <p className="text-micro text-red-500 mt-1">{errors.skills}</p>
            )}
          </div>

          {/* Referral Strength */}
          <div>
            <label className="block text-micro font-bold text-body-secondary mb-1.5 uppercase tracking-wide">
              Referral Strength: {form.referral_strength}%
            </label>
            <input type="range" min={0} max={100} step={5}
              value={form.referral_strength ?? 70}
              onChange={e => set('referral_strength', parseInt(e.target.value, 10))}
              className="w-full accent-primary" />
            <p className="text-[10px] text-subtle mt-1">How confident are you about getting this person hired?</p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-micro font-bold text-body-secondary mb-1.5 uppercase tracking-wide">Description *</label>
            <textarea
              value={form.description ?? ''}
              onChange={e => set('description', e.target.value)}
              onBlur={() => handleBlur('description')}
              maxLength={MAX_LEN.description}
              rows={3}
              placeholder="Describe the role, team, or what you're looking for in a candidate..."
              aria-invalid={!!errors.description}
              className={`${inputClass('description')} resize-none`}
            />
            <div className="flex items-center justify-between mt-1">
              {errors.description
                ? <p className="text-micro text-red-500">{errors.description}</p>
                : <span />}
              <span className={`text-[10px] tabular-nums ${descLen > MAX_LEN.description ? 'text-red-500 font-semibold' : descLen >= MAX_LEN.description * 0.9 ? 'text-amber-500' : 'text-subtle'}`}>
                {descLen}/{MAX_LEN.description}
              </span>
            </div>
          </div>

          {/* API error */}
          {createMutation.isError && (
            <p className="text-caption text-red-600 bg-red-50 rounded-xl px-4 py-2">
              {(createMutation.error as any)?.message ?? 'Failed to create referral.'}
            </p>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-3 rounded-2xl text-base font-bold text-body-secondary bg-surface-hover hover:bg-surface-mid transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={createMutation.isPending}
              className="flex-1 py-3 rounded-2xl text-base font-bold text-white bg-gradient-to-r from-indigo-600 to-primary hover:opacity-90 transition-all hover:shadow-lg disabled:opacity-60">
              {createMutation.isPending ? 'Posting...' : 'Post Referral'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
