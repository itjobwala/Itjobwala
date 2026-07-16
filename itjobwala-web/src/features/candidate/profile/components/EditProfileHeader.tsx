'use client';

import { useRef } from 'react';
import { ProfileValidator } from '../schemas/profile.schema';

export interface EditableProfile {
  fullName: string;
  title: string;
  experienceYears: string;
  expectedSalary: string;
  currentSalary: string;
  workStatus: string;
  availabilityToJoin: string;
  email: string;
  phone: string;
  location: string;
  github: string;
  linkedIn: string;
  about?: string;
  openToWork: boolean;
  name?: string;
}

interface Props {
  profile: EditableProfile;
  onChange: (profile: EditableProfile) => void;
  profilePhotoUrl?: string;
}

function Field({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  error,
  required,
  min,
  max,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  error?: string;
  required?: boolean;
  min?: string;
  max?: string;
}) {
  return (
    <label className="block">
      <span className="block text-caption font-bold text-muted mb-1.5">
        {label}{required && <span className="text-danger ml-0.5">*</span>}
      </span>
      <input
        type={type}
        value={value || ''}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        min={min}
        max={max}
        className={`w-full rounded-xl border bg-surface px-3.5 py-2.5 text-sm font-medium text-heading outline-none transition-colors placeholder:text-muted ${
          type === 'date' ? 'max-w-xs' : ''
        } ${
          error ? 'border-danger focus:border-danger' : 'border-token focus:border-primary/50'
        }`}
      />
      {error && <span className="mt-1 block text-micro font-semibold text-danger">{error}</span>}
    </label>
  );
}

export default function EditProfileHeader({ profile, onChange, profilePhotoUrl }: Props) {
  const avatarRef = useRef<HTMLInputElement>(null);

  const nameErr     = profile.fullName
    ? (ProfileValidator.validateName(profile.fullName, 'Full name')?.message ?? '') : '';
  const phoneErr    = profile.phone
    ? (ProfileValidator.validatePhone(profile.phone)?.message ?? '') : '';
  const emailErr    = profile.email
    ? (ProfileValidator.validateEmail(profile.email)?.message ?? '') : '';
  const linkedInErr = profile.linkedIn
    ? (ProfileValidator.validateUrl(profile.linkedIn, 'linkedin.com')?.message ?? '') : '';
  const githubErr   = profile.github
    ? (ProfileValidator.validateUrl(profile.github, 'github.com')?.message ?? '') : '';
  const expErr      = profile.experienceYears != null && profile.experienceYears !== ''
    ? (Number(profile.experienceYears) < 0 || Number(profile.experienceYears) > 60 ? 'Must be between 0 and 60' : '') : '';
  const titleErr    = profile.title?.trim() && profile.title.trim().length > 100
    ? 'Max 100 characters.' : '';
  const locationErr = profile.location?.trim()
    ? (!/[a-zA-Z]/.test(profile.location.trim())
        ? 'Must contain letters (e.g. Bangalore, Remote).'
        : profile.location.trim().length > 100
          ? 'Max 100 characters.'
          : '')
    : '';

  const initials = (profile.fullName || profile.name || profile.email || 'US')
    .trim()
    .split(' ')
    .filter(Boolean)
    .map((w: string) => w[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  function update<K extends keyof EditableProfile>(key: K, value: EditableProfile[K]) {
    onChange({ ...profile, [key]: value });
  }

  return (
    <div className="flex flex-col -mx-6 -mt-6 overflow-hidden">
      <div className="h-28 bg-gradient-to-r from-primary/10 via-blue-50 to-primary/5 relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(21,87,255,0.13)_0%,transparent_60%),radial-gradient(circle_at_80%_50%,rgba(59,130,246,0.13)_0%,transparent_60%)]" />
      </div>

      <div className="px-6 sm:px-8 pb-6">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 -mt-10 mb-5">
          <div className="relative w-fit">
            <button
              type="button"
              onClick={() => avatarRef.current?.click()}
              className="group w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-blue-400 flex items-center justify-center text-white font-extrabold text-2xl border-4 border-white shadow-lg relative overflow-hidden"
            >
              {profilePhotoUrl ? (
                <img
                  src={profilePhotoUrl}
                  alt="Profile photo"
                  className="w-full h-full object-cover"
                />
              ) : (
                initials
              )}
              <span className="absolute inset-0 bg-black/35 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                  <circle cx="12" cy="13" r="4" />
                </svg>
              </span>
            </button>
            <input ref={avatarRef} type="file" accept="image/*" className="hidden" />
            {profile.openToWork && (
              <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-success text-white text-[10px] font-bold rounded-full px-2 py-0.5 whitespace-nowrap border-2 border-white">
                Open to work
              </span>
            )}
          </div>

        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <Field label="Full name" value={profile.fullName} onChange={value => update('fullName', value)} required error={nameErr} />
          <Field label="Current role / title" value={profile.title} onChange={value => update('title', value)} placeholder="e.g. Senior Software Engineer" error={titleErr} />
          <Field label="Experience (Years)" value={profile.experienceYears} onChange={value => update('experienceYears', value)} type="number" min="0" max="60" error={expErr} />
          <Field label="Location" value={profile.location} onChange={value => update('location', value)} placeholder="e.g. Bangalore, Remote" error={locationErr} />
          <label className="block">
            <span className="block text-caption font-bold text-muted mb-1.5">Current Salary</span>
            <input
              type="number"
              min="1"
              value={profile.currentSalary || ''}
              onChange={e => update('currentSalary', e.target.value)}
              placeholder="e.g. 80000"
              className={`w-full rounded-xl border bg-surface px-3.5 py-2.5 text-sm font-medium text-heading outline-none transition-colors placeholder:text-muted ${
                profile.currentSalary !== '' && profile.currentSalary != null && Number(profile.currentSalary) <= 0
                  ? 'border-danger focus:border-danger'
                  : 'border-token focus:border-primary/50'
              }`}
            />
            {profile.currentSalary !== '' && profile.currentSalary != null && Number(profile.currentSalary) <= 0 && (
              <span className="mt-1 block text-micro font-semibold text-danger">Current salary must be greater than 0</span>
            )}
          </label>
          <Field label="Available to join" value={profile.availabilityToJoin || ''} onChange={value => update('availabilityToJoin', value)} type="date" />
          <Field label="Email" value={profile.email} onChange={value => update('email', value)} type="email" required error={emailErr} />
          <Field label="Phone" value={profile.phone} onChange={value => update('phone', value)} type="tel" required error={phoneErr} placeholder="+919876543210" />
          <Field label="LinkedIn Profile" value={profile.linkedIn} onChange={value => update('linkedIn', value)} placeholder="https://linkedin.com/in/username" error={linkedInErr} />
          <Field label="GitHub Profile" value={profile.github} onChange={value => update('github', value)} placeholder="https://github.com/username" error={githubErr} />
        </div>

        <div className="mt-5 border-t border-token pt-5">
          <label className="flex items-center gap-3 cursor-pointer w-fit">
            <div className="relative flex items-center">
              <input
                type="checkbox"
                checked={profile.openToWork ?? false}
                onChange={e => update('openToWork', e.target.checked)}
                className="peer sr-only"
              />
              <div className="h-6 w-11 rounded-full bg-surface-mid after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-token after:bg-white after:transition-all after:content-[''] peer-checked:bg-success peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-success/30"></div>
            </div>
            <div>
              <span className="block text-sm font-bold text-heading">Open to work</span>
              <span className="block text-caption text-muted mt-0.5">Show recruiters you are actively looking for jobs</span>
            </div>
          </label>
        </div>

      </div>
    </div>
  );
}
