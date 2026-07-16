'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SmartNavbar } from '@/layout/navbar';
import { ProtectedRoute } from '@/features/auth';
import EmptyState from '@/src/components/ui/EmptyState';
import { useNotificationsQuery, useMarkReadMutation, useMarkAllReadMutation } from '@/src/hooks/useNotifications';
import { TYPE_ICON, TYPE_COLOR, NotifAvatar, getDateGroup, DATE_GROUP_ORDER } from '@/features/navbar/utils/notificationDisplay';
import { relativeTime } from '@/src/lib/utils/format';
import type { Notification } from '@/features/navbar';

export default function NotificationsPageClient() {
  const [page, setPage] = useState(1);
  const router = useRouter();

  const { data, isLoading } = useNotificationsQuery({ page, limit: 20 });
  const markRead    = useMarkReadMutation();
  const markAllRead = useMarkAllReadMutation();

  const notifications: Notification[] = data?.notifications ?? [];
  const pagination = data?.pagination;

  // Auto-mark-read profile_view items on load
  useEffect(() => {
    const unreadProfileViews = notifications.filter(
      n => n.type === 'profile_view' && !n.is_read
    );
    unreadProfileViews.forEach(n => markRead.mutate(n.id));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  function handleItemClick(n: Notification) {
    if (!n.is_read) markRead.mutate(n.id);
    if (n.action_url) router.push(n.action_url);
  }

  // ── Date grouping ─────────────────────────────────────────────────────────
  const groups = new Map<string, Notification[]>();
  for (const n of notifications) {
    const g = getDateGroup(n.created_at);
    if (!groups.has(g)) groups.set(g, []);
    groups.get(g)!.push(n);
  }

  return (
    <ProtectedRoute>
      <SmartNavbar />
      <main className="min-h-screen bg-app pt-16 lg:pt-[72px]">
        <div className="max-w-2xl mx-auto px-4 py-8">

          {/* ── Header ──────────────────────────────────────────────────── */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-h3 text-heading" style={{ letterSpacing: '-0.5px' }}>
                Notifications
              </h3>
              {pagination && (
                <p className="text-small-text text-subtle mt-0.5">{pagination.total} total</p>
              )}
            </div>
            <button
              onClick={() => markAllRead.mutate()}
              disabled={markAllRead.isPending}
              className="text-sm font-semibold text-primary hover:text-primary/80 transition-colors disabled:opacity-50"
            >
              Mark all read
            </button>
          </div>

          {/* ── Loading ──────────────────────────────────────────────────── */}
          {isLoading && (
            <div className="flex flex-col gap-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-surface rounded-2xl border border-token p-4 flex gap-3 animate-pulse">
                  <div className="w-10 h-10 rounded-xl bg-surface-alt shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-surface-alt rounded w-2/3" />
                    <div className="h-3 bg-surface-alt rounded w-full" />
                    <div className="h-2 bg-surface-alt rounded w-1/4" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── Empty state ──────────────────────────────────────────────── */}
          {!isLoading && notifications.length === 0 && (
            <EmptyState
              icon={
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="text-muted">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
              }
              title="No notifications yet"
              description="You'll see updates about your applications, interviews, and profile views here."
            />
          )}

          {/* ── Grouped list ─────────────────────────────────────────────── */}
          {!isLoading && notifications.length > 0 && (
            <div className="flex flex-col gap-6">
              {DATE_GROUP_ORDER.filter(g => groups.has(g)).map(group => (
                <section key={group}>
                  <h2 className="text-caption font-bold text-subtle uppercase tracking-wider mb-2 px-1">
                    {group}
                  </h2>
                  <div className="bg-surface rounded-2xl border border-token overflow-hidden">
                    {groups.get(group)!.map((n, idx, arr) => {
                      const icon     = TYPE_ICON[n.type]  ?? TYPE_ICON.default;
                      const color    = TYPE_COLOR[n.type] ?? TYPE_COLOR.default;
                      const clickable = !!n.action_url;
                      const isLast   = idx === arr.length - 1;
                      return (
                        <div
                          key={n.id}
                          onClick={() => handleItemClick(n)}
                          className={[
                            'flex items-start gap-4 p-4 transition-colors',
                            !isLast ? 'border-b border-token' : '',
                            clickable ? 'cursor-pointer hover:bg-surface-alt' : 'cursor-default',
                            !n.is_read ? 'bg-primary/[0.02]' : '',
                          ].join(' ')}
                        >
                          <NotifAvatar src={n.actor_avatar_url} icon={icon} color={color} size="w-10 h-10" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <p className={`text-sm leading-snug ${!n.is_read ? 'font-semibold text-heading' : 'font-medium text-body-secondary'}`}>
                                {n.title}
                              </p>
                              <span className="text-micro text-subtle shrink-0">{relativeTime(n.created_at)}</span>
                            </div>
                            <p className="text-sm text-subtle mt-0.5">{n.message}</p>
                            {clickable && (
                              <p className="text-micro font-semibold text-primary mt-1.5">View details →</p>
                            )}
                          </div>
                          {!n.is_read && (
                            <span className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </section>
              ))}
            </div>
          )}

          {/* ── Pagination ───────────────────────────────────────────────── */}
          {pagination && (pagination.has_prev || pagination.has_next) && (
            <div className="flex items-center justify-between mt-8">
              <button
                onClick={() => setPage(p => p - 1)}
                disabled={!pagination.has_prev}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-token text-sm font-semibold text-heading hover:bg-surface-alt transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M15 18l-6-6 6-6" />
                </svg>
                Previous
              </button>
              <span className="text-sm text-subtle">
                Page {pagination.page} of {pagination.total_pages}
              </span>
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={!pagination.has_next}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-token text-sm font-semibold text-heading hover:bg-surface-alt transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </button>
            </div>
          )}

        </div>
      </main>
    </ProtectedRoute>
  );
}
