'use client';

import { useState } from 'react';
import type { ReferralJob } from '../../types/referral.types';
import { useApplyReferralMutation } from '../../hooks';

interface Props {
  job:       ReferralJob;
  isOpen:    boolean;
  onClose:   () => void;
  onSuccess: () => void;
}

export default function ReferralRequestModal({ job, isOpen, onClose, onSuccess }: Props) {
  const [message,     setMessage]     = useState('');
  const [resumeUrl,   setResumeUrl]   = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const applyMutation = useApplyReferralMutation();

  if (!isOpen) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    applyMutation.mutate(
      { id: job.id, payload: { message: message || undefined, resume_url: resumeUrl || undefined, linkedin_url: linkedinUrl || undefined } },
      { onSuccess },
    );
  }

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-blue-500 px-6 py-5 text-white">
          <h2 className="text-[18px] font-extrabold">Request Referral</h2>
          <p className="text-[13px] text-white/80 mt-0.5">
            {job.job_title} · {job.company_name}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-[12px] font-bold text-gray-700 mb-1.5">
              Why should {job.owner_name ?? 'the referrer'} refer you?
              <span className="text-gray-400 font-normal ml-1">(optional but recommended)</span>
            </label>
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              maxLength={2000}
              rows={4}
              placeholder="Briefly explain your background and why you're a great fit..."
              className="w-full text-[13px] border border-gray-200 rounded-2xl px-4 py-3 resize-none focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/10 transition-all placeholder:text-gray-400"
            />
          </div>

          <div>
            <label className="block text-[12px] font-bold text-gray-700 mb-1.5">Resume URL</label>
            <input
              type="url"
              value={resumeUrl}
              onChange={e => setResumeUrl(e.target.value)}
              placeholder="https://drive.google.com/..."
              className="w-full text-[13px] border border-gray-200 rounded-2xl px-4 py-2.5 focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/10 transition-all placeholder:text-gray-400"
            />
          </div>

          <div>
            <label className="block text-[12px] font-bold text-gray-700 mb-1.5">LinkedIn Profile</label>
            <input
              type="url"
              value={linkedinUrl}
              onChange={e => setLinkedinUrl(e.target.value)}
              placeholder="https://linkedin.com/in/..."
              className="w-full text-[13px] border border-gray-200 rounded-2xl px-4 py-2.5 focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/10 transition-all placeholder:text-gray-400"
            />
          </div>

          {applyMutation.isError && (
            <p className="text-[12px] text-red-600 bg-red-50 rounded-xl px-4 py-2">
              {(applyMutation.error as any)?.message ?? 'Something went wrong.'}
            </p>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-2xl text-[14px] font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={applyMutation.isPending}
              className="flex-1 py-3 rounded-2xl text-[14px] font-bold text-white bg-primary hover:bg-primary/90 transition-all hover:shadow-md hover:shadow-primary/25 disabled:opacity-60"
            >
              {applyMutation.isPending ? 'Sending...' : 'Send Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
