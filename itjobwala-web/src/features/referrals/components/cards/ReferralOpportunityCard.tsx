'use client';

import { useState } from 'react';
import Image from 'next/image';
import type { ReferralJob } from '../../types/referral.types';
import ReferralStatusBadge from '../status/ReferralStatusBadge';
import ReferralRequestModal from '../modals/ReferralRequestModal';

interface Props {
  job:       ReferralJob;
  onApplied?: () => void;
}

function StrengthBar({ value }: { value: number }) {
  const color = value >= 80 ? 'bg-emerald-500' : value >= 50 ? 'bg-primary' : 'bg-amber-400';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all duration-500`} style={{ width: `${value}%` }} />
      </div>
      <span className="text-[10px] font-bold text-gray-500 shrink-0">{value}%</span>
    </div>
  );
}

function Avatar({ name, photo, size = 32 }: { name: string | null; photo: string | null; size?: number }) {
  if (photo) {
    return <Image src={photo} alt={name ?? ''} width={size} height={size} className="rounded-full object-cover" />;
  }
  const initials = (name ?? '?').split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
  return (
    <div
      className="rounded-full bg-gradient-to-br from-primary to-blue-400 flex items-center justify-center text-white font-bold shrink-0"
      style={{ width: size, height: size, fontSize: size * 0.35 }}
    >
      {initials}
    </div>
  );
}

export default function ReferralOpportunityCard({ job, onApplied }: Props) {
  const [showModal, setShowModal] = useState(false);
  const alreadyApplied = !!job.user_request;
  const isOwn = !!job.is_mine;

  const companyInitial = job.company_name.charAt(0).toUpperCase();

  return (
    <>
      <div className="group bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-lg hover:border-primary/20 transition-all duration-300 flex flex-col overflow-hidden">
        {/* Header strip */}
        <div className="h-1.5 w-full bg-gradient-to-r from-primary via-blue-400 to-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity" />

        <div className="p-6 flex flex-col gap-4 flex-1">
          {/* Company + Role */}
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-50 border border-gray-100 flex items-center justify-center text-lg font-black text-primary shrink-0 shadow-sm">
              {companyInitial}
            </div>
            <div className="min-w-0">
              <h3 className="text-[15px] font-extrabold text-[#0f172a] leading-tight truncate" style={{ letterSpacing: '-0.2px' }}>
                {job.job_title}
              </h3>
              <p className="text-[12px] text-gray-500 font-medium truncate">{job.company_name}</p>
            </div>
            {job.user_request && (
              <div className="ml-auto shrink-0">
                <ReferralStatusBadge status={job.user_request.status} size="sm" />
              </div>
            )}
          </div>

          {/* Meta info */}
          <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-[12px] text-gray-500">
            {job.location && (
              <span className="flex items-center gap-1">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5"/></svg>
                {job.location}
              </span>
            )}
            {job.experience_required && (
              <span className="flex items-center gap-1">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>
                {job.experience_required}
              </span>
            )}
            {job.salary_range && (
              <span className="flex items-center gap-1 font-semibold text-emerald-600">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                {job.salary_range}
              </span>
            )}
          </div>

          {/* Skills */}
          {job.skills.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {job.skills.slice(0, 4).map(s => (
                <span key={s} className="text-[10px] font-semibold text-primary bg-primary/8 border border-primary/15 rounded-full px-2.5 py-0.5">
                  {s}
                </span>
              ))}
              {job.skills.length > 4 && (
                <span className="text-[10px] font-semibold text-gray-400 px-1">+{job.skills.length - 4}</span>
              )}
            </div>
          )}

          {/* Referral strength */}
          {job.referral_strength != null && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">Referral Strength</span>
              </div>
              <StrengthBar value={job.referral_strength} />
            </div>
          )}

          {/* Referrer row */}
          <div className="flex items-center justify-between pt-1 border-t border-gray-50">
            <div className="flex items-center gap-2">
              <Avatar name={job.owner_name} photo={job.owner_photo} size={28} />
              <div>
                <p className="text-[11px] font-semibold text-gray-700 leading-none">{job.owner_name ?? 'Anonymous'}</p>
                <p className="text-[10px] text-gray-400">Referrer</p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-[10px] text-gray-400">
              {job.average_response_time && (
                <span className="flex items-center gap-0.5">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  {job.average_response_time}
                </span>
              )}
              <span>{job.request_count} requests</span>
            </div>
          </div>

          {/* Reward badge + CTA */}
          {!isOwn && (
            <div className="flex items-center gap-2 mt-auto">
              {job.referral_reward && (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-1.5 shrink-0">
                  🎁 {job.referral_reward}
                </span>
              )}
              <button
                onClick={() => !alreadyApplied && setShowModal(true)}
                disabled={alreadyApplied}
                className={`flex-1 py-2.5 rounded-2xl text-[13px] font-bold transition-all ${
                  alreadyApplied
                    ? 'bg-gray-100 text-gray-400 cursor-default'
                    : 'bg-primary text-white hover:bg-primary/90 hover:shadow-md hover:shadow-primary/25 active:scale-[0.98]'
                }`}
              >
                {alreadyApplied ? 'Requested' : 'Request Referral'}
              </button>
            </div>
          )}
        </div>
      </div>

      <ReferralRequestModal
        job={job}
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={() => { setShowModal(false); onApplied?.(); }}
      />
    </>
  );
}
