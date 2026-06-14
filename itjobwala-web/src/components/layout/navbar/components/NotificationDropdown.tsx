'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useNotificationsQuery, useMarkReadMutation, useMarkAllReadMutation } from '@/src/hooks/useNotifications';
import { TYPE_ICON, TYPE_COLOR, NotifAvatar } from '@/features/navbar/utils/notificationDisplay';
import { relativeTime } from '@/src/lib/utils/format';
import type { Notification } from '@/features/navbar';

interface Props {
  count: number;
}

export default function NotificationDropdown({ count }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

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

  function handleItemClick(n: Notification) {
    if (!n.is_read) markRead.mutate(n.id);
    if (n.action_url) {
      setOpen(false);
      router.push(n.action_url);
    }
  }

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
              const clickable = !!n.action_url;
              return (
                <div
                  key={n.id}
                  onClick={() => handleItemClick(n)}
                  className={`flex items-start gap-3 px-4 py-3 border-b border-token last:border-0 hover:bg-surface-alt transition-colors ${
                    clickable ? 'cursor-pointer' : 'cursor-default'
                  } ${!n.is_read ? 'bg-primary/[0.02]' : ''}`}
                >
                  <NotifAvatar src={n.actor_avatar_url} icon={icon} color={color} size="w-8 h-8" />
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
          <Link
            href="/candidate/notifications"
            onClick={() => setOpen(false)}
            className="block w-full text-sm font-semibold text-primary hover:text-primary/80 transition-colors text-center py-1"
          >
            View all notifications →
          </Link>
        </div>
      </div>
    </div>
  );
}
