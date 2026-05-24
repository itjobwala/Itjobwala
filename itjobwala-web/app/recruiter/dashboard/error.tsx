'use client';

import Link from 'next/link';

interface Props {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function RecruiterDashboardError({ reset }: Props) {
  return (
    <div className="min-h-screen bg-[#f8faff] flex items-center justify-center px-6">
      <div className="text-center max-w-sm">
        <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-5">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.2">
            <rect x="2" y="7" width="20" height="14" rx="2" />
            <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
          </svg>
        </div>
        <h2 className="text-[18px] font-extrabold text-[#0f172a] mb-2" style={{ letterSpacing: '-0.3px' }}>
          Dashboard failed to load
        </h2>
        <p className="text-[13px] text-gray-500 mb-6">
          We couldn&apos;t load your dashboard data. This is usually temporary.
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={reset}
            className="px-5 py-2.5 bg-primary text-white text-[13px] font-semibold rounded-xl hover:opacity-90 transition-opacity"
          >
            Retry
          </button>
          <Link
            href="/recruiter/posted-jobs"
            className="px-5 py-2.5 text-[13px] font-semibold text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
          >
            View jobs
          </Link>
        </div>
      </div>
    </div>
  );
}
