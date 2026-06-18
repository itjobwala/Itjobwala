'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRecruiterNotificationsQuery } from '@/features/recruiter/hooks';
import Card from '@/src/components/ui/Card';

const PREVIEW = 5;

const TYPE_CONFIG: Record<string, { dotColor: string; icon: React.ReactNode }> = {
  application: {
    dotColor: 'bg-blue-500',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  interview: {
    dotColor: 'bg-amber-500',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
        <rect x="3" y="4" width="20" height="20" rx="2" />
        <path d="M16 2v4M8 2v4M3 10h18" />
      </svg>
    ),
  },
  shortlist: {
    dotColor: 'bg-violet-500',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    ),
  },
  message: {
    dotColor: 'bg-green-500',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
  job_update: {
    dotColor: 'bg-gray-400',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
        <rect x="2" y="7" width="20" height="14" rx="2" />
        <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
      </svg>
    ),
  },
  default: {
    dotColor: 'bg-blue-400',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
      </svg>
    ),
  },
};

function relativeTime(iso: string): string {
  const ms   = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(ms / 60_000);
  if (mins < 2)   return 'Just now';
  if (mins < 60)  return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)   return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return 'Yesterday';
  return `${days} days ago`;
}

export default function ActivityFeed() {
  const [showAll, setShowAll] = useState(false);
  const { data: notifications, isLoading } = useRecruiterNotificationsQuery(10);
  const visible = showAll ? notifications : notifications?.slice(0, PREVIEW);

  return (
    <Card className="shadow-sm" overflow>
      <div className="mb-5">
        <h2 className="text-base font-extrabold text-heading" style={{ letterSpacing: '-0.3px' }}>
          Activity Feed
        </h2>
        <p className="text-caption text-subtle mt-0.5">Your recent recruiting activity</p>
      </div>

      {isLoading ? (
        <div className="space-y-4 animate-pulse">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex gap-4">
              <div className="w-[30px] h-[30px] rounded-xl bg-surface-hover shrink-0" />
              <div className="flex-1 space-y-1.5 pb-4 border-b border-gray-50">
                <div className="h-3 bg-surface-hover rounded w-3/4" />
                <div className="h-2.5 bg-surface-alt rounded w-1/4" />
              </div>
            </div>
          ))}
        </div>
      ) : !notifications || notifications.length === 0 ? (
        <p className="text-sm text-subtle text-center py-4">No recent activity.</p>
      ) : (
        <div className="relative">
          <div className="absolute left-[15px] top-2 bottom-2 w-px bg-token" />
          <div className="space-y-4">
            {visible!.map(item => {
              const cfg = TYPE_CONFIG[item.type] ?? TYPE_CONFIG.default;
              const inner = (
                <>
                  <div className="relative z-10 shrink-0 mt-0.5">
                    <div className={`w-[30px] h-[30px] rounded-xl ${cfg.dotColor} flex items-center justify-center text-white`}>
                      {cfg.icon}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0 pb-4 border-b border-gray-50 last:border-0 last:pb-0">
                    <p className={`text-sm font-semibold leading-snug transition-colors ${!item.is_read ? 'text-heading' : 'text-muted'} group-hover:text-primary`}>
                      {item.message}
                    </p>
                    <p className="text-micro text-subtle mt-1 font-medium">{relativeTime(item.created_at)}</p>
                  </div>
                </>
              );

              return item.action_url ? (
                <Link key={item.id} href={item.action_url} className="flex gap-4 group">
                  {inner}
                </Link>
              ) : (
                <div key={item.id} className="flex gap-4 group">{inner}</div>
              );
            })}
          </div>
        </div>
      )}

      {notifications && notifications.length > 0 && (
        <div className="mt-4 pt-4 border-t border-token flex items-center justify-center gap-4">
          {!showAll && notifications.length > PREVIEW ? (
            <button
              onClick={() => setShowAll(true)}
              className="text-caption font-bold text-primary hover:text-primary/80 transition-colors"
            >
              View all activity ({notifications.length}) →
            </button>
          ) : showAll ? (
            <>
              <button
                onClick={() => setShowAll(false)}
                className="text-caption font-bold text-subtle hover:text-muted transition-colors"
              >
                Show less
              </button>
              <Link
                href="/recruiter/activity"
                className="text-caption font-bold text-primary hover:text-primary/80 transition-colors"
              >
                Open activity page →
              </Link>
            </>
          ) : (
            <Link
              href="/recruiter/activity"
              className="text-caption font-bold text-primary hover:text-primary/80 transition-colors"
            >
              View all activity →
            </Link>
          )}
        </div>
      )}
    </Card>
  );
}
