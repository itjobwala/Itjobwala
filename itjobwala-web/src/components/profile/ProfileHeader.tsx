'use client';

import React from 'react';
import Link from 'next/link';
import Card from '@/src/components/ui/Card';
import type { CandidateProfile } from '@/src/types/profile';

interface Props {
  profile: CandidateProfile;
  onUploadPhoto?: () => void;
  onUploadCover?: () => void;
}

function formatSalaryLpa(val: string | number): string {
  const n = parseFloat(String(val)) / 100000;
  if (isNaN(n)) return '0';
  return n % 1 === 0 ? String(Math.round(n)) : n.toFixed(1);
}

function getInitials(profile: CandidateProfile): string {
  const full = [profile.first_name, profile.last_name].filter(Boolean).join(' ') || profile.name || profile.email;
  return full.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
}

function getDisplayName(profile: CandidateProfile): string {
  return [profile.first_name, profile.last_name].filter(Boolean).join(' ') || profile.name || profile.email;
}

export default function ProfileHeader({ profile, onEdit, onUploadPhoto, onUploadCover }: Props & { onEdit?: () => void; onUploadPhoto?: () => void; onUploadCover?: () => void }) {
  const displayName = getDisplayName(profile);
  const initials    = getInitials(profile);

  return (
    <Card padding="none">
      {/* Cover banner */}
      <button
        onClick={onUploadCover}
        className="w-full h-28 bg-gradient-to-r from-primary/10 via-blue-50 to-primary/5 relative group overflow-hidden hover:brightness-95 transition-all cursor-pointer border-0 p-0"
        title="Click to upload cover photo"
      >
        {profile.profile_cover_url ? (
          <img
            src={profile.profile_cover_url}
            alt="Cover"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 opacity-30"
            style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, #1557FF22 0%, transparent 60%), radial-gradient(circle at 80% 50%, #3b82f622 0%, transparent 60%)' }}
          />
        )}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" className="opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg">
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
            <circle cx="12" cy="13" r="4" />
          </svg>
        </div>
      </button>

      <div className="px-6 sm:px-8 pb-6">
        {/* Avatar row */}
        <div className="flex items-end justify-between -mt-10 mb-4 pt-2">
          <div className="relative group">
            <button
              onClick={onUploadPhoto}
              className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-blue-400 flex items-center justify-center text-white font-extrabold text-2xl border-4 border-white shadow-lg relative overflow-hidden group"
            >
              {profile.profile_photo_url ? (
                <img
                  src={profile.profile_photo_url}
                  alt={getDisplayName(profile)}
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
            {profile.open_to_work && (
              <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-green-500 text-white text-[10px] font-bold rounded-full px-2 py-0.5 whitespace-nowrap border-2 border-white">
                Open to work
              </span>
            )}
          </div>

          <button
            onClick={onEdit}
            className="flex items-center gap-1.5 text-[13px] font-semibold text-gray-600 border border-gray-200 rounded-xl px-4 py-2 hover:border-primary/40 hover:text-primary transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            Edit Profile
          </button>
        </div>

        {/* Name + role */}
        <div className="mb-4">
          <h1 className="text-[22px] font-extrabold text-[#0f172a] leading-tight mb-0.5" style={{ letterSpacing: '-0.5px' }}>
            {displayName}
          </h1>
          <p className="text-[15px] font-semibold text-gray-500">{profile.title ?? ''}</p>
        </div>

        {/* Meta grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-5">
          {([
            profile.location    ? { icon: <MapPinIcon />,    text: profile.location } : null,
            profile.experience_years != null ? { icon: <BriefcaseIcon />, text: `${profile.experience_years} years experience` } : null,
            profile.current_salary != null ? { icon: <DollarIcon />, text: `${formatSalaryLpa(profile.current_salary)} LPA` } : null,
            profile.availability_to_join ? { icon: <CalendarIcon />, text: `Available to join: ${profile.availability_to_join.split('T')[0]}` } : null,
            { icon: <MailIcon />,  text: profile.email },
            profile.phone       ? { icon: <PhoneIcon />,     text: profile.phone } : null,
          ].filter(Boolean) as Array<{ icon: React.ReactElement; text: string }>).map(({ icon, text }) => (
            <div key={text} className="flex items-center gap-2.5 text-[13px] text-gray-500">
              <span className="text-gray-400">{icon}</span>
              {text}
            </div>
          ))}
        </div>

        {/* Social links */}
        <div className="flex items-center gap-3 flex-wrap">
          {profile.linked_in && (
            <a
              href={profile.linked_in.startsWith('http') ? profile.linked_in : `https://${profile.linked_in}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-[12px] font-semibold text-primary bg-primary/10 rounded-lg px-3 py-1.5 hover:bg-primary/20 transition-colors"
            >
              <LinkedInIcon /> LinkedIn
            </a>
          )}
          {profile.github && (
            <a
              href={profile.github.startsWith('http') ? profile.github : `https://${profile.github}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-[12px] font-semibold text-gray-700 bg-gray-100 rounded-lg px-3 py-1.5 hover:bg-gray-200 transition-colors"
            >
              <GitHubIcon /> GitHub
            </a>
          )}
        </div>
      </div>

    </Card>
  );
}

function MapPinIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
      <circle cx="12" cy="9" r="2.5" />
    </svg>
  );
}
function BriefcaseIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
      <rect x="2" y="7" width="20" height="14" rx="2" />
      <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
    </svg>
  );
}
function MailIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m2 7 10 7 10-7" />
    </svg>
  );
}
function PhoneIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.24h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.69 2.81a2 2 0 0 1-.45 2.11L7.91 8.91a16 16 0 0 0 6 6l.82-.82a2 2 0 0 1 2.11-.45c.91.33 1.85.56 2.81.69a2 2 0 0 1 1.73 2.09z" />
    </svg>
  );
}
function LinkedInIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}
function GitHubIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0 0 22 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  );
}

function DollarIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
      <path d="M4 3h16a2 2 0 0 1 2 2v6a10 10 0 0 1-10 10A10 10 0 0 1 2 11V5a2 2 0 0 1 2-2z" />
      <polyline points="8 10 12 14 16 10" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}
