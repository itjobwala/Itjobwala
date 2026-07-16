'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { SmartNavbar } from '@/layout/navbar';
import { ProtectedRoute } from '@/features/auth';
import { ReferralOpportunities, ReferralInbox } from '@/features/referrals';

type Tab = 'browse' | 'inbox';

function ReferralsContent() {
  const searchParams = useSearchParams();
  const [tab, setTab] = useState<Tab>('browse');

  useEffect(() => {
    const t = searchParams.get('tab');
    if (t === 'inbox' || t === 'sent' || t === 'received') setTab('inbox');
  }, [searchParams]);

  return (
    <div className="pt-16 lg:pt-[72px]">
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-[1200px] mx-auto px-5 sm:px-8 py-5">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-[20px] font-extrabold text-[#0f172a]" style={{ letterSpacing: '-0.3px' }}>
                Referrals
              </h1>
              <p className="text-[13px] text-gray-500 mt-0.5">Browse opportunities or manage your referral requests</p>
            </div>
            <div className="flex items-center bg-gray-100 rounded-2xl p-1.5 gap-1">
              {([
                { key: 'browse', label: 'Browse Opportunities' },
                { key: 'inbox',  label: 'My Inbox' },
              ] as { key: Tab; label: string }[]).map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setTab(key)}
                  className={`px-5 py-2 rounded-xl text-[13px] font-bold transition-all ${
                    tab === key
                      ? 'bg-white text-primary shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-[1200px] mx-auto px-5 sm:px-8 py-8">
        {tab === 'browse' ? <ReferralOpportunities /> : <ReferralInbox />}
      </div>
    </div>
  );
}

export default function ReferralsPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#f8fafc]">
        <SmartNavbar />
        <Suspense>
          <ReferralsContent />
        </Suspense>
      </div>
    </ProtectedRoute>
  );
}
