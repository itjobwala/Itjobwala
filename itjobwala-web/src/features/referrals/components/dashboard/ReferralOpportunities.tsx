'use client';

import { useState } from 'react';
import { useReferralJobsInfiniteQuery } from '../../hooks';
import ReferralOpportunityCard from '../cards/ReferralOpportunityCard';
import ReferralSkeleton        from '../shared/ReferralSkeleton';
import ReferralEmptyState      from '../shared/ReferralEmptyState';
import CreateReferralModal     from '../modals/CreateReferralModal';

export default function ReferralOpportunities() {
  const [showCreate, setShowCreate] = useState(false);
  const [sort, setSort]             = useState<'newest' | 'popular'>('newest');

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, refetch } =
    useReferralJobsInfiniteQuery({ sort, limit: 9 });

  const jobs = data?.pages.flatMap(p => p.referral_jobs) ?? [];

  return (
    <div>
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-extrabold text-heading" style={{ letterSpacing: '-0.3px' }}>
            Referral Opportunities
          </h2>
          <p className="text-sm text-muted mt-0.5">Get referred by someone who works there</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-surface-hover rounded-xl p-1">
            {(['newest', 'popular'] as const).map(s => (
              <button
                key={s}
                onClick={() => setSort(s)}
                className={`px-3 py-1.5 rounded-lg text-caption font-bold transition-all ${
                  sort === s ? 'bg-surface text-primary shadow-sm' : 'text-muted hover:text-body'
                }`}
              >
                {s === 'newest' ? 'Latest' : 'Popular'}
              </button>
            ))}
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 bg-primary text-white text-sm font-bold px-4 py-2.5 rounded-2xl hover:bg-primary/90 hover:shadow-md hover:shadow-primary/25 transition-all active:scale-[0.98]"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>
            Post Referral
          </button>
        </div>
      </div>

      {/* Grid */}
      {isLoading ? (
        <ReferralSkeleton count={9} />
      ) : jobs.length === 0 ? (
        <ReferralEmptyState
          title="No referral opportunities yet"
          description="Be the first to post a referral opportunity and help someone get their dream job."
          action={
            <button onClick={() => setShowCreate(true)}
              className="bg-primary text-white text-sm font-bold px-5 py-2.5 rounded-2xl hover:bg-primary/90 transition-colors">
              Post First Referral
            </button>
          }
        />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {jobs.map(job => (
              <ReferralOpportunityCard key={job.id} job={job} onApplied={refetch} />
            ))}
          </div>

          {hasNextPage && (
            <div className="text-center mt-8">
              <button
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                className="px-8 py-3 text-sm font-bold text-primary bg-primary/8 rounded-2xl hover:bg-primary/15 transition-colors disabled:opacity-60"
              >
                {isFetchingNextPage ? 'Loading...' : 'Load More'}
              </button>
            </div>
          )}
        </>
      )}

      <CreateReferralModal
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
        onSuccess={() => { setShowCreate(false); refetch(); }}
      />
    </div>
  );
}
