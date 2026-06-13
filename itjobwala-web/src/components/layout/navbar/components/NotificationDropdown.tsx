'use client';

import { useState, useRef, useEffect } from 'react';
import { useNotificationsQuery, useMarkReadMutation, useMarkAllReadMutation } from '@/src/hooks/useNotifications';
import type { Notification, NotificationType } from '@/features/navbar';

const TYPE_ICON: Partial<Record<NotificationType, React.ReactNode>> & { default: React.ReactNode } = {
  profile_view: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
    </svg>
  ),
  application_status: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
      <rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
    </svg>
  ),
  interview_scheduled: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
      <rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  ),
  offer_received: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  ),
  new_applicant: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
    </svg>
  ),
  default: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  ),
};

const TYPE_COLOR: Partial<Record<NotificationType, string>> & { default: string } = {
  profile_view:        'bg-blue-50 text-blue-600',
  application_status:  'bg-purple-50 text-purple-600',
  interview_scheduled: 'bg-amber-50 text-amber-600',
  offer_received:      'bg-yellow-50 text-yellow-600',
  new_applicant:       'bg-green-50 text-green-600',
  default:             'bg-surface-alt text-muted',
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

interface Props {
  count: number;
}

export default function NotificationDropdown({ count }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const { data } = useNotificationsQuery({ is_read: false });
  const markRead    = useMarkReadMutation();
  const markAllRead = useMarkAllReadMutation();

  const notifications: Notification[] = data?.notifications ?? [];
  const unread = count;

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className={`relative flex items-center justify-center w-9 h-9 rounded-xl transition-colors ${
          open ? 'bg-primary/10 text-primary' : 'text-muted hover:bg-surface-hover hover:text-heading'
        }`}
        aria-label="Notifications"
      >
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {unread > 0 && (
          <span className="absolute top-1 right-1 w-[17px] h-[17px] bg-red-500 text-white text-[9px] font-extrabold rounded-full flex items-center justify-center leading-none">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      <div className={`absolute right-0 top-[calc(100%+8px)] w-[360px] bg-surface rounded-2xl border border-token shadow-xl shadow-black/[0.08] transition-all duration-200 z-[300] ${
        open ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-2 pointer-events-none'
      }`}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-token">
          <div className="flex items-center gap-2">
            <span className="text-base font-extrabold text-heading">Notifications</span>
            {unread > 0 && (
              <span className="text-micro font-bold bg-primary/10 text-primary rounded-full px-2 py-0.5">
                {unread} new
              </span>
            )}
          </div>
          {unread > 0 && (
            <button
              onClick={() => markAllRead.mutate()}
              className="text-caption font-semibold text-primary hover:text-primary/80 transition-colors"
            >
              Mark all read
            </button>
          )}
        </div>

        <div className="max-h-[380px] overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-subtle">
              No new notifications
            </div>
          ) : (
            notifications.map(n => {
              const icon  = TYPE_ICON[n.type]  ?? TYPE_ICON.default;
              const color = TYPE_COLOR[n.type] ?? TYPE_COLOR.default;
              return (
                <div
                  key={n.id}
                  className={`flex items-start gap-3 px-4 py-3 border-b border-token last:border-0 hover:bg-surface-alt transition-colors cursor-pointer ${
                    !n.is_read ? 'bg-primary/[0.02]' : ''
                  }`}
                  onClick={() => !n.is_read && markRead.mutate(n.id)}
                >
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
                    {icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm leading-snug ${!n.is_read ? 'font-semibold text-heading' : 'text-body-secondary'}`}>
                      {n.title}
                    </p>
                    <p className="text-micro text-subtle mt-0.5 truncate">{n.message}</p>
                    <p className="text-micro text-subtle mt-1">{relativeTime(n.created_at)}</p>
                  </div>
                  {!n.is_read && <span className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1" />}
                </div>
              );
            })
          )}
        </div>

        <div className="px-4 py-2.5 border-t border-token">
          <button
            onClick={() => setOpen(false)}
            className="w-full text-sm font-semibold text-primary hover:text-primary/80 transition-colors text-center py-1"
          >
            View all notifications →
          </button>
        </div>
      </div>
    </div>
  );
}
