import type { ReferralStatus } from '../types/referral.types';

export const STATUS_CONFIG: Record<ReferralStatus, {
  label:   string;
  color:   string;
  bg:      string;
  dot:     string;
  icon:    string;
}> = {
  pending:   { label: 'Pending',   color: 'text-amber-700',   bg: 'bg-amber-50 border-amber-200',     dot: 'bg-amber-400',   icon: '⏳' },
  accepted:  { label: 'Accepted',  color: 'text-blue-700',    bg: 'bg-blue-50 border-blue-200',       dot: 'bg-blue-500',    icon: '✓'  },
  applied:   { label: 'Applied',   color: 'text-teal-700',    bg: 'bg-teal-50 border-teal-200',       dot: 'bg-teal-500',    icon: '✅' },
  rejected:  { label: 'Rejected',  color: 'text-red-600',     bg: 'bg-red-50 border-red-200',         dot: 'bg-red-400',     icon: '✕'  },
  referred:  { label: 'Referred',  color: 'text-indigo-700',  bg: 'bg-indigo-50 border-indigo-200',   dot: 'bg-indigo-500',  icon: '→'  },
  interview: { label: 'Interview', color: 'text-purple-700',  bg: 'bg-purple-50 border-purple-200',   dot: 'bg-purple-500',  icon: '📅' },
  hired:     { label: 'Hired!',    color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200', dot: 'bg-emerald-500', icon: '🎉' },
  paid:      { label: 'Paid',      color: 'text-green-700',   bg: 'bg-green-50 border-green-200',     dot: 'bg-green-500',   icon: '💸' },
};

export const TIMELINE_STEPS: ReferralStatus[] = [
  'pending', 'accepted', 'applied',
];

export function getStatusConfig(status: ReferralStatus) {
  return STATUS_CONFIG[status] ?? STATUS_CONFIG.pending;
}

// Actions available to the REFERRER (received tab)
export function getNextStatuses(current: ReferralStatus): ReferralStatus[] {
  const map: Record<ReferralStatus, ReferralStatus[]> = {
    pending:   ['accepted'],
    accepted:  [],
    applied:   [],
    rejected:  [],
    referred:  [],
    interview: [],
    hired:     [],
    paid:      [],
  };
  return map[current] ?? [];
}
