'use client';

import { useRef } from 'react';

export interface EditableProfile {
  firstName: string;
  lastName: string;
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
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  error?: string;
}) {
  return (
    <label className="block">
      <span className="block text-[12px] font-bold text-gray-500 mb-1.5">{label}</span>
      <input
        type={type}
        value={value || ''}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-[13px] font-medium text-[#0f172a] outline-none transition-colors placeholder:text-gray-400 ${
          type === 'date' ? 'max-w-xs' : ''
        } ${
          error ? 'border-red-300 focus:border-red-400' : 'border-gray-200 focus:border-primary/50'
        }`}
      />
      {error && <span className="mt-1 block text-[11px] font-semibold text-red-500">{error}</span>}
    </label>
  );
}

export default function EditProfileHeader({ profile, onChange, profilePhotoUrl }: Props) {
  const avatarRef = useRef<HTMLInputElement>(null);
  
  const firstLetter = profile.firstName?.[0] || '';
  const lastLetter = profile.lastName?.[0] || '';
  let initials = `${firstLetter}${lastLetter}`.toUpperCase();
  
  if (!initials && profile.name) {
    initials = profile.name
      .split(' ')
      .filter(Boolean)
      .map(w => w[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  }
  
  if (!initials) {
    initials = profile.email?.substring(0, 2).toUpperCase() || 'US';
  }

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
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                  <circle cx="12" cy="13" r="4" />
                </svg>
              </span>
            </button>
            <input ref={avatarRef} type="file" accept="image/*" className="hidden" />
            {profile.openToWork && (
              <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-green-500 text-white text-[10px] font-bold rounded-full px-2 py-0.5 whitespace-nowrap border-2 border-white">
                Open to work
              </span>
            )}
          </div>

        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <Field label="First name" value={profile.firstName} onChange={value => update('firstName', value)} />
          <Field label="Last name" value={profile.lastName} onChange={value => update('lastName', value)} />
          <div className="sm:col-span-2">
            <Field label="Current role / title" value={profile.title} onChange={value => update('title', value)} />
          </div>
          <Field label="Experience (Years)" value={profile.experienceYears} onChange={value => update('experienceYears', value)} type="number" />
          <Field label="Location" value={profile.location} onChange={value => update('location', value)} />
          <Field label="Current Salary" value={profile.currentSalary || ''} onChange={value => update('currentSalary', value)} type="number" placeholder="e.g. 80000" />
          <Field label="Available to join" value={profile.availabilityToJoin || ''} onChange={value => update('availabilityToJoin', value)} type="date" />
          <Field label="Email" value={profile.email} onChange={value => update('email', value)} type="email" error={!profile.email.includes('@') ? 'Enter a valid email' : ''} />
          <Field label="Phone" value={profile.phone} onChange={value => update('phone', value)} type="tel" />
          <Field label="LinkedIn Profile" value={profile.linkedIn} onChange={value => update('linkedIn', value)} placeholder="e.g. linkedin.com/in/username" />
          <Field label="GitHub Profile" value={profile.github} onChange={value => update('github', value)} placeholder="e.g. github.com/username" />
        </div>

        <div className="mt-5 border-t border-gray-100 pt-5">
          <label className="flex items-center gap-3 cursor-pointer w-fit">
            <div className="relative flex items-center">
              <input
                type="checkbox"
                checked={profile.openToWork ?? false}
                onChange={e => update('openToWork', e.target.checked)}
                className="peer sr-only"
              />
              <div className="h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-green-500 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-green-500/30"></div>
            </div>
            <div>
              <span className="block text-[13px] font-bold text-[#0f172a]">Open to work</span>
              <span className="block text-[12px] text-gray-500 mt-0.5">Show recruiters you are actively looking for jobs</span>
            </div>
          </label>
        </div>

      </div>
    </div>
  );
}
