'use client';

import { useState } from 'react';
import Link from 'next/link';
import { RecruiterShell } from '@/layout/shell';
import Card from '@/src/components/ui/Card';
import Button from '@/src/components/ui/Button';
import {
  useRecruiterNotificationsPagedQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
} from '@/features/recruiter/hooks';
import type { RecruiterNotification } from '../services/recruiterDashboard.api';

const TYPE_CONFIG: Record<string, { dotColor: string; label: string; icon: React.ReactNode }> = {
  application: {
    dotColor: 'bg-blue-500',
    label: 'Application',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  interview: {
    dotColor: 'bg-amber-500',
    label: 'Interview',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
        <rect x="3" y="4" width="20" height="20" rx="2" />
        <path d="M16 2v4M8 2v4M3 10h18" />
      </svg>
    ),
  },
  shortlist: {
    dotColor: 'bg-violet-500',
    label: 'Shortlist',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    ),
  },
  message: {
    dotColor: 'bg-green-500',
    label: 'Message',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
  job_update: {
    dotColor: 'bg-gray-400',
    label: 'Job update',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
        <rect x="2" y="7" width="20" height="14" rx="2" />
        <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
      </svg>
    ),
  },
  default: {
    dotColor: 'bg-blue-400',
    label: 'Activity',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
      </svg>
    ),
  },
};

const FILTER_TYPES = ['all', 'application', 'interview', 'shortlist', 'message', 'job_update'] as const;
type FilterType = typeof FILTER_TYPES[number];

function relativeTime(iso: string): string {
  const ms   = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(ms / 60_000);
  if (mins < 2)   return 'Just now';
  if (mins < 60)  return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)   return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return 'Yesterday';
  if (days < 30)  return `${days} days ago`;
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function SkeletonRow() {
  return (
    <div className="flex gap-4 px-5 py-4 animate-pulse">
      <div className="w-9 h-9 rounded-xl bg-surface-hover shrink-0" />
      <div className="flex-1 space-y-2 py-0.5">
        <div className="h-3 bg-surface-hover rounded w-3/4" />
        <div className="h-2.5 bg-surface-alt rounded w-1/4" />
      </div>
    </div>
  );
}

function NotificationRow({
  item,
  onMarkRead,
}: {
  item: RecruiterNotification;
  onMarkRead: (id: string) => void;
}) {
  const cfg = TYPE_CONFIG[item.type] ?? TYPE_CONFIG.default;

  const content = (
    <div
      className={`flex gap-4 px-5 py-4 border-b border-gray-50 last:border-0 transition-colors group ${
        !item.is_read ? 'bg-primary/[0.02]' : ''
      } hover:bg-surface-alt`}
      onClick={() => !item.is_read && onMarkRead(item.id)}
    >
      <div className={`w-9 h-9 rounded-xl ${cfg.dotColor} flex items-center justify-center text-white shrink-0 mt-0.5`}>
        {cfg.icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3">
          <p className={`text-sm font-semibold leading-snug ${!item.is_read ? 'text-heading' : 'text-muted'} group-hover:text-primary transition-colors`}>
            {item.message}
          </p>
          {!item.is_read && (
            <span className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5" />
          )}
        </div>
        <div className="flex items-center gap-2 mt-1">
          <span className={`text-micro font-semibold px-1.5 py-0.5 rounded-md ${cfg.dotColor} text-white opacity-80`}>
            {cfg.label}
          </span>
          <span className="text-micro text-subtle font-medium">{relativeTime(item.created_at)}</span>
        </div>
      </div>
    </div>
  );

  return item.action_url ? (
    <Link href={item.action_url}>{content}</Link>
  ) : (
    <div className="cursor-default">{content}</div>
  );
}

const PAGE_SIZE = 20;

export default function ActivityPageClient() {
  const [page, setPage]           = useState(1);
  const [filter, setFilter]       = useState<FilterType>('all');

  const { data, isLoading } = useRecruiterNotificationsPagedQuery(page, PAGE_SIZE);
  const markReadMutation    = useMarkNotificationReadMutation();
  const markAllMutation     = useMarkAllNotificationsReadMutation();

  const notifications = data?.notifications ?? [];
  const filtered = filter === 'all'
    ? notifications
    : notifications.filter(n => n.type === filter);

  const unreadCount  = data?.unread_count ?? 0;
  const pagination   = data?.pagination;

  return (
    <RecruiterShell>
      <div className="max-w-[860px] mx-auto px-5 sm:px-8 py-8 space-y-5">

        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <Link
                href="/recruiter/dashboard"
                className="text-subtle hover:text-muted transition-colors"
                aria-label="Back to dashboard"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
              </Link>
              <h1 className="text-2xl font-extrabold text-heading" style={{ letterSpacing: '-0.4px' }}>
                Activity Feed
              </h1>
              {unreadCount > 0 && (
                <span className="text-micro font-bold text-white bg-primary rounded-full px-2 py-0.5">
                  {unreadCount} unread
                </span>
              )}
            </div>
            <p className="text-sm text-subtle mt-0.5 ml-7">Your complete recruiting activity history</p>
          </div>

          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              loading={markAllMutation.isPending}
              onClick={() => markAllMutation.mutate()}
              className="shrink-0"
            >
              Mark all as read
            </Button>
          )}
        </div>

        {/* Type filter tabs */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {FILTER_TYPES.map(type => (
            <button
              key={type}
              onClick={() => { setFilter(type); setPage(1); }}
              className={`text-caption font-semibold px-3 py-1.5 rounded-lg transition-colors capitalize ${
                filter === type
                  ? 'bg-primary text-white'
                  : 'bg-surface-hover text-muted hover:bg-surface-mid'
              }`}
            >
              {type === 'all' ? 'All' : (TYPE_CONFIG[type]?.label ?? type)}
            </button>
          ))}
        </div>

        {/* List */}
        <Card padding="none" overflow>
          {isLoading ? (
            <div className="divide-y divide-gray-50">
              {[...Array(6)].map((_, i) => <SkeletonRow key={i} />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gray-300 mb-3">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              <p className="text-base font-semibold text-subtle">No activity found</p>
              <p className="text-caption text-gray-300 mt-1">
                {filter === 'all' ? 'Your activity will appear here as you recruit.' : `No ${TYPE_CONFIG[filter]?.label ?? filter} activity yet.`}
              </p>
            </div>
          ) : (
            <div>
              {filtered.map(item => (
                <NotificationRow
                  key={item.id}
                  item={item}
                  onMarkRead={id => markReadMutation.mutate(id)}
                />
              ))}
            </div>
          )}
        </Card>

        {/* Pagination */}
        {pagination && pagination.total_pages > 1 && (
          <div className="flex items-center justify-between pt-1">
            <p className="text-caption text-subtle">
              Page {pagination.page} of {pagination.total_pages} &middot; {pagination.total} total
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => p - 1)}
                disabled={!pagination.has_prev}
                className="text-caption font-semibold px-3 py-1.5 rounded-lg bg-surface-hover text-muted hover:bg-surface-mid disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                ← Previous
              </button>
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={!pagination.has_next}
                className="text-caption font-semibold px-3 py-1.5 rounded-lg bg-surface-hover text-muted hover:bg-surface-mid disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Next →
              </button>
            </div>
          </div>
        )}

      </div>
    </RecruiterShell>
  );
}
