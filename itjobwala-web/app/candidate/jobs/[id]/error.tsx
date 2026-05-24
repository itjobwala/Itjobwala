'use client';

import Link from 'next/link';

interface Props {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function JobDetailError({ reset }: Props) {
  return (
    <div className="min-h-screen bg-[#f9fafb] flex items-center justify-center px-6">
      <div className="text-center max-w-sm">
        <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-5">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <h2 className="text-[18px] font-extrabold text-[#0f172a] mb-2" style={{ letterSpacing: '-0.3px' }}>
          Couldn&apos;t load this job
        </h2>
        <p className="text-[13px] text-gray-500 mb-6">
          This job may no longer be available, or something went wrong loading it.
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={reset}
            className="px-5 py-2.5 bg-primary text-white text-[13px] font-semibold rounded-xl hover:opacity-90 transition-opacity"
          >
            Try again
          </button>
          <Link
            href="/candidate/jobs"
            className="px-5 py-2.5 text-[13px] font-semibold text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
          >
            Browse jobs
          </Link>
        </div>
      </div>
    </div>
  );
}
