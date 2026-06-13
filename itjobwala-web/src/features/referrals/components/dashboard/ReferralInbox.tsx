'use client';

import { useState } from 'react';
import { useMyReferralRequestsQuery, useReceivedReferralsQuery, useMyReferralJobsQuery } from '../../hooks';
import ReferralRequestCard   from '../cards/ReferralRequestCard';
import ReferralOpportunityCard from '../cards/ReferralOpportunityCard';
import ReferralEmptyState    from '../shared/ReferralEmptyState';
import type { ReferralStatus } from '../../types/referral.types';
import type { ReceivedReferralRequest, ReferralRequest } from '../../types/referral.types';

type Tab = 'sent' | 'received' | 'my-posts';

const STATUS_FILTERS: { value: string; label: string }[] = [
  { value: '',         label: 'All' },
  { value: 'pending',  label: 'Pending' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'applied',  label: 'Applied' },
  { value: 'rejected', label: 'Rejected' },
];

export default function ReferralInbox() {
  const [tab,    setTab]    = useState<Tab>('sent');
  const [status, setStatus] = useState('');

  const { data: sentData,     isLoading: sentLoading }     = useMyReferralRequestsQuery({ status: status || undefined });
  const { data: receivedData, isLoading: receivedLoading } = useReceivedReferralsQuery({ status: status || undefined });
  const { data: myPostsData,  isLoading: myPostsLoading, refetch: refetchMyPosts } = useMyReferralJobsQuery();

  const sentRequests     = (sentData?.requests     ?? []) as ReferralRequest[];
  const receivedRequests = (receivedData?.requests ?? []) as ReceivedReferralRequest[];
  const myPosts          = myPostsData?.referral_jobs ?? [];

  const loading = tab === 'sent' ? sentLoading : tab === 'received' ? receivedLoading : myPostsLoading;
  const items   = tab === 'sent' ? sentRequests : receivedRequests;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <h2 className="text-2xl font-extrabold text-heading" style={{ letterSpacing: '-0.3px' }}>
          Referral Inbox
        </h2>

        {/* Tabs */}
        <div className="flex items-center bg-surface-hover rounded-xl p-1">
          {([
            { key: 'sent',     label: 'Sent' },
            { key: 'received', label: 'Received' },
            { key: 'my-posts', label: 'My Posts' },
          ] as { key: Tab; label: string }[]).map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`px-4 py-1.5 rounded-lg text-caption font-bold transition-all ${
                tab === key ? 'bg-surface text-primary shadow-sm' : 'text-muted hover:text-body'
              }`}
            >
              {label}
              {key === 'received' && (receivedData?.pagination?.total ?? 0) > 0 && (
                <span className="ml-1.5 bg-primary text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">
                  {receivedData!.pagination.total}
                </span>
              )}
              {key === 'my-posts' && myPosts.length > 0 && (
                <span className="ml-1.5 bg-indigo-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">
                  {myPosts.length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Status filter — only for sent/received tabs */}
      {tab !== 'my-posts' && (
        <div className="flex gap-2 flex-wrap mb-5">
          {STATUS_FILTERS.map(f => (
            <button
              key={f.value}
              onClick={() => setStatus(f.value)}
              className={`text-micro font-bold px-3 py-1.5 rounded-full border transition-all ${
                status === f.value
                  ? 'bg-primary text-white border-primary'
                  : 'bg-surface text-body-secondary border-token hover:border-primary/40 hover:text-primary'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      )}

      {/* Content */}
      {tab === 'my-posts' ? (
        loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-surface rounded-3xl border border-token p-6 animate-pulse h-64" />
            ))}
          </div>
        ) : myPosts.length === 0 ? (
          <ReferralEmptyState
            title="No referral opportunities posted"
            description="Post a referral opportunity to help others get referred at your company."
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {myPosts.map(job => (
              <ReferralOpportunityCard key={job.id} job={{ ...job, is_mine: true }} onApplied={refetchMyPosts} />
            ))}
          </div>
        )
      ) : loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-surface rounded-2xl border border-token p-5 animate-pulse">
              <div className="flex gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-surface-hover" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-surface-hover rounded-full w-3/4" />
                  <div className="h-3 bg-surface-hover rounded-full w-1/2" />
                </div>
              </div>
              <div className="h-8 bg-surface-hover rounded-xl" />
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <ReferralEmptyState
          title={tab === 'sent' ? 'No referral requests sent' : 'No referral requests received'}
          description={tab === 'sent'
            ? 'Browse referral opportunities and send your first request.'
            : 'Post a referral opportunity and start receiving requests from candidates.'}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {items.map((req: any) => (
            <ReferralRequestCard key={req.id} request={req} isReceived={tab === 'received'} />
          ))}
        </div>
      )}
    </div>
  );
}
