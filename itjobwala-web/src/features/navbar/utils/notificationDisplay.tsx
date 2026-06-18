'use client';

import { useState } from 'react';
import type { NotificationType } from '../types/notifications.types';

export const TYPE_ICON: Partial<Record<NotificationType, React.ReactNode>> & { default: React.ReactNode } = {
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
      <rect x="3" y="4" width="20" height="20" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" />
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
  message_received: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  ),
  default: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  ),
};

export const TYPE_COLOR: Partial<Record<NotificationType, string>> & { default: string } = {
  profile_view:        'bg-info-bg text-info',
  application_status:  'bg-violet-bg text-violet',
  interview_scheduled: 'bg-warning-bg text-warning',
  offer_received:      'bg-warning-bg text-warning',
  new_applicant:       'bg-success-bg text-success',
  message_received:    'bg-info-bg text-info',
  default:             'bg-surface-alt text-muted',
};

type DateGroup = 'Today' | 'Yesterday' | 'This week' | 'Older';

export function getDateGroup(iso: string): DateGroup {
  const today = new Date();
  const d = new Date(iso);
  const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  const dMidnight     = new Date(d.getFullYear(),     d.getMonth(),     d.getDate()).getTime();
  const daysDiff      = Math.round((todayMidnight - dMidnight) / 86_400_000);
  if (daysDiff === 0) return 'Today';
  if (daysDiff === 1) return 'Yesterday';
  if (daysDiff < 7)   return 'This week';
  return 'Older';
}

export const DATE_GROUP_ORDER: DateGroup[] = ['Today', 'Yesterday', 'This week', 'Older'];

/**
 * Renders an actor avatar when available, falling back to the generic type-icon
 * circle on null src or broken image URL. `size` controls the circle diameter class.
 */
export function NotifAvatar({
  src,
  icon,
  color,
  size = 'w-8 h-8',
}: {
  src:   string | null;
  icon:  React.ReactNode;
  color: string;
  size?: string;
}) {
  const [broken, setBroken] = useState(false);

  if (src && !broken) {
    return (
      <img
        src={src}
        alt=""
        onError={() => setBroken(true)}
        className={`${size} rounded-full object-cover shrink-0`}
      />
    );
  }

  return (
    <div className={`${size} rounded-xl flex items-center justify-center shrink-0 ${color}`}>
      {icon}
    </div>
  );
}
