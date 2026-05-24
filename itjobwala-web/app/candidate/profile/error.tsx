'use client';

interface Props {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ProfileError({ reset }: Props) {
  return (
    <div className="min-h-screen bg-[#f9fafb] flex items-center justify-center px-6">
      <div className="text-center max-w-sm">
        <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-5">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </div>
        <h2 className="text-[18px] font-extrabold text-[#0f172a] mb-2" style={{ letterSpacing: '-0.3px' }}>
          Profile failed to load
        </h2>
        <p className="text-[13px] text-gray-500 mb-6">
          We couldn&apos;t load your profile. Please try again.
        </p>
        <button
          onClick={reset}
          className="px-5 py-2.5 bg-primary text-white text-[13px] font-semibold rounded-xl hover:opacity-90 transition-opacity"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
