'use client';

import { useState } from 'react';
import Image from 'next/image';
import ReferralStatusBadge from '../status/ReferralStatusBadge';
import ReferralTimeline    from '../status/ReferralTimeline';
import type { ReceivedReferralRequest } from '../../types/referral.types';
import { getNextStatuses } from '../../utils/referralStatus';
import { useUpdateReferralStatusMutation, useMarkAppliedMutation } from '../../hooks';
import type { ReferralStatus } from '../../types/referral.types';

interface Props {
  request:    ReceivedReferralRequest;
  isReceived: boolean;
}

const ACTION_LABELS: Partial<Record<ReferralStatus, string>> = {
  accepted: 'Accept',
};

const ACTION_STYLES: Partial<Record<ReferralStatus, string>> = {
  accepted: 'bg-primary text-white hover:bg-primary/90',
};

export default function ReferralRequestCard({ request, isReceived }: Props) {
  const [expanded, setExpanded]         = useState(false);
  const [confirmStatus, setConfirm]     = useState<ReferralStatus | null>(null);
  const [notes, setNotes]               = useState('');
  const [applyLink, setApplyLink]       = useState('');
  const [applyLinkErr, setApplyLinkErr] = useState('');
  const [appliedClicked, setAppliedClicked] = useState(false);
  const updateMutation                  = useUpdateReferralStatusMutation();
  const markAppliedMutation             = useMarkAppliedMutation();

  const nextStatuses = isReceived ? getNextStatuses(request.status) : [];

  function handleAction(status: ReferralStatus) {
    setConfirm(status);
    setNotes('');
    setApplyLink('');
    setApplyLinkErr('');
  }

  function confirmAction() {
    if (!confirmStatus) return;
    if (confirmStatus === 'accepted' && !applyLink.trim()) {
      setApplyLinkErr('Apply link is required');
      return;
    }
    updateMutation.mutate(
      { id: request.id, status: confirmStatus, notes: notes.trim() || undefined, apply_link: applyLink.trim() || undefined },
      { onSuccess: () => { setConfirm(null); setNotes(''); setApplyLink(''); } },
    );
  }

  function handleMarkApplied() {
    markAppliedMutation.mutate(request.id);
  }

  const party = isReceived ? request.candidate : null;

  return (
    <div className="bg-surface rounded-2xl border border-token shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      <div className="p-5">

        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            {party?.photo ? (
              <Image src={party.photo} alt={party.name ?? ''} width={44} height={44} className="rounded-full object-cover shrink-0" />
            ) : (
              <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary to-blue-400 flex items-center justify-center text-white text-sm font-bold shrink-0">
                {(party?.name ?? (request.referral_job?.company_name ?? '?')).charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <p className="text-base font-bold text-heading">
                {isReceived ? party?.name ?? 'Candidate' : request.referral_job?.company_name ?? 'Company'}
              </p>
              <p className="text-micro text-muted">
                {isReceived ? party?.title ?? '' : request.referral_job?.job_title ?? ''}
              </p>
              {isReceived && (party?.location || party?.experience_years != null) && (
                <div className="flex items-center gap-2 mt-0.5 text-[10px] text-subtle">
                  {party?.experience_years != null && (
                    <span className="flex items-center gap-0.5">
                      <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>
                      {party.experience_years} yrs exp
                    </span>
                  )}
                  {party?.location && (
                    <span className="flex items-center gap-0.5">
                      <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/></svg>
                      {party.location}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
          <ReferralStatusBadge status={request.status} />
        </div>

        {/* Job info */}
        {request.referral_job && (
          <div className="text-caption text-muted mb-3 flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-body">{request.referral_job.job_title}</span>
            <span>·</span>
            <span>{request.referral_job.company_name}</span>
            {request.referral_job.location && <><span>·</span><span>{request.referral_job.location}</span></>}
          </div>
        )}

        {/* Timeline */}
        <div className="mb-4 px-1">
          <ReferralTimeline currentStatus={request.status} timeline={request.timeline} />
        </div>

        {/* Candidate's pitch */}
        {request.message && (
          <button
            onClick={() => setExpanded(e => !e)}
            className="w-full text-left text-caption text-body-secondary bg-surface-alt rounded-xl px-3 py-2.5 mb-3 hover:bg-surface-hover transition-colors border border-token"
          >
            <span className="text-[10px] font-bold text-subtle uppercase tracking-wide block mb-0.5">
              {isReceived ? 'Their Pitch' : 'Your Message'}
            </span>
            {expanded ? request.message : `${request.message.slice(0, 120)}${request.message.length > 120 ? '...' : ''}`}
          </button>
        )}

        {/* ── CANDIDATE VIEW: Accepted ── */}
        {!isReceived && request.status === 'accepted' && (
          <div className="space-y-2.5 mb-3">

            {/* Instructions from referrer */}
            {request.notes && (
              <div className="text-caption text-indigo-800 bg-indigo-50 border border-indigo-200 rounded-xl px-4 py-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="text-indigo-500"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                  <span className="text-[10px] font-extrabold text-indigo-600 uppercase tracking-wide">Instructions from Referrer</span>
                </div>
                <p className="leading-relaxed">{request.notes}</p>
              </div>
            )}

            {request.apply_link ? (
              <>
                {/* Step 1 — Apply Now */}
                <a
                  href={request.apply_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setAppliedClicked(true)}
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-base font-extrabold bg-emerald-600 text-white hover:bg-emerald-700 active:scale-[0.98] transition-all shadow-sm shadow-emerald-200"
                >
                  Apply Now
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                </a>

                {/* Divider + instruction */}
                {appliedClicked && (
                  <p className="text-center text-micro text-subtle">
                    Applied at the company? Come back here and click Submit below.
                  </p>
                )}

                {/* Step 2 — Submit */}
                <button
                  onClick={handleMarkApplied}
                  disabled={markAppliedMutation.isPending || !appliedClicked}
                  className={`w-full py-2.5 rounded-xl text-sm font-bold transition-all border ${
                    appliedClicked
                      ? 'bg-teal-600 text-white hover:bg-teal-700 border-transparent disabled:opacity-50'
                      : 'bg-surface-alt text-subtle border-token cursor-not-allowed'
                  }`}
                >
                  {markAppliedMutation.isPending ? 'Submitting…' : 'Submit — I\'ve Applied'}
                </button>

                {!appliedClicked && (
                  <p className="text-center text-[10px] text-subtle">
                    Click "Apply Now" first, then submit after you've applied.
                  </p>
                )}
              </>
            ) : (
              <div className="bg-surface-alt border border-token rounded-xl px-4 py-3 flex items-center gap-2 text-caption text-muted">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                Waiting for the referrer to share the apply link…
              </div>
            )}
          </div>
        )}

        {/* ── CANDIDATE VIEW: Applied (submitted) ── */}
        {!isReceived && request.status === 'applied' && (
          <div className="mb-3 space-y-2">
            <div className="bg-teal-50 border border-teal-200 rounded-xl px-4 py-3 flex items-start gap-2.5">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-teal-600 shrink-0 mt-0.5"><polyline points="20 6 9 17 4 12"/></svg>
              <div>
                <p className="text-caption font-bold text-teal-800">Application submitted!</p>
                <p className="text-micro text-teal-600 mt-0.5">The referrer has been notified that you applied.</p>
              </div>
            </div>
            {request.apply_link && (
              <a
                href={request.apply_link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-micro text-subtle hover:text-body underline underline-offset-2 break-all"
              >
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                {request.apply_link}
              </a>
            )}
          </div>
        )}

        {/* ── REFERRER VIEW: Accepted — show link they sent ── */}
        {isReceived && request.status === 'accepted' && request.apply_link && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 mb-3">
            <p className="text-[10px] font-extrabold text-blue-600 uppercase tracking-wide mb-1.5">Link sent to candidate</p>
            <a
              href={request.apply_link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-caption font-medium text-blue-700 hover:text-blue-900 underline underline-offset-2 break-all"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
              {request.apply_link}
            </a>
          </div>
        )}

        {/* ── REFERRER VIEW: Applied ── */}
        {isReceived && request.status === 'applied' && (
          <div className="mb-3 space-y-2">
            <div className="bg-teal-50 border border-teal-200 rounded-xl px-4 py-3 flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-teal-600 shrink-0"><polyline points="20 6 9 17 4 12"/></svg>
              <p className="text-caption font-bold text-teal-800">Candidate has applied at your company!</p>
            </div>
            {request.apply_link && (
              <div className="text-micro text-muted px-1">
                <span className="font-semibold text-body-secondary">Via: </span>
                <a
                  href={request.apply_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-2 hover:text-body break-all"
                >
                  {request.apply_link}
                </a>
              </div>
            )}
          </div>
        )}

        {/* Referrer's notes — shown to referrer only, pending/accepted */}
        {isReceived && request.notes && (request.status === 'pending' || request.status === 'accepted') && (
          <div className="text-micro text-body-secondary bg-amber-50 border border-amber-100 rounded-xl px-3 py-2 mb-3">
            <span className="font-bold text-amber-700">Your note: </span>{request.notes}
          </div>
        )}

        {/* Resume / LinkedIn links */}
        <div className="flex gap-2 mb-3">
          {request.resume_url && (
            <a href={request.resume_url} target="_blank" rel="noopener noreferrer"
              className="text-micro font-semibold text-primary bg-primary/8 px-3 py-1.5 rounded-lg hover:bg-primary/15 transition-colors flex items-center gap-1">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
              Resume
            </a>
          )}
          {request.linkedin_url && (
            <a href={request.linkedin_url} target="_blank" rel="noopener noreferrer"
              className="text-micro font-semibold text-[#0A66C2] bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-1">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
              LinkedIn
            </a>
          )}
        </div>

        {/* Referrer action button (Accept — pending only) */}
        {isReceived && nextStatuses.length > 0 && !confirmStatus && (
          <div className="flex gap-2 flex-wrap">
            {nextStatuses.map(s => (
              <button
                key={s}
                onClick={() => handleAction(s)}
                className={`text-caption font-semibold px-4 py-2 rounded-xl transition-all ${ACTION_STYLES[s] ?? 'bg-surface-hover text-body hover:bg-surface-mid'}`}
              >
                {ACTION_LABELS[s] ?? s}
              </button>
            ))}
          </div>
        )}

        {/* Accept confirmation form */}
        {confirmStatus && (
          <div className="bg-surface-alt rounded-2xl px-4 py-3 space-y-3 border border-token">
            <p className="text-caption font-bold text-body">
              Accept this request and share the apply link:
            </p>

            <div>
              <label className="block text-micro font-semibold text-muted mb-1">
                Application / Referral Link <span className="text-red-500">*</span>
              </label>
              <input
                type="url"
                value={applyLink}
                onChange={e => { setApplyLink(e.target.value); setApplyLinkErr(''); }}
                placeholder="https://careers.yourcompany.com/apply?ref=..."
                className={`w-full text-caption border rounded-xl px-3 py-2 focus:outline-none focus:ring-1 transition-all placeholder:text-subtle ${
                  applyLinkErr ? 'border-red-400 focus:border-red-400 focus:ring-red-200' : 'border-token focus:border-primary/50 focus:ring-primary/20'
                }`}
              />
              {applyLinkErr && <p className="text-[10px] text-red-500 mt-0.5">{applyLinkErr}</p>}
              <p className="text-[10px] text-subtle mt-1">The candidate will use this link to apply at your company.</p>
            </div>

            <div>
              <label className="block text-micro font-semibold text-muted mb-1">
                Additional instructions <span className="text-subtle font-normal">(optional)</span>
              </label>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder='e.g. "Mention my name as referrer. HR will reach out in 1–2 weeks."'
                rows={2}
                className="w-full text-caption border border-token rounded-xl px-3 py-2 resize-none focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all placeholder:text-subtle"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={confirmAction}
                disabled={updateMutation.isPending}
                className="flex-1 text-caption font-bold text-white bg-primary px-3 py-2 rounded-xl hover:bg-primary/90 disabled:opacity-50 transition-all"
              >
                {updateMutation.isPending ? 'Sending…' : 'Accept & Send Link'}
              </button>
              <button
                onClick={() => { setConfirm(null); setNotes(''); setApplyLink(''); setApplyLinkErr(''); }}
                className="text-caption font-semibold text-muted px-4 py-2 rounded-xl hover:bg-surface-mid transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
