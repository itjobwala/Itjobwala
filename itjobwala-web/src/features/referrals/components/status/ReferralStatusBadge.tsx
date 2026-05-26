import { getStatusConfig } from '../../utils/referralStatus';
import type { ReferralStatus } from '../../types/referral.types';

interface Props {
  status: ReferralStatus;
  size?:  'sm' | 'md';
}

export default function ReferralStatusBadge({ status, size = 'md' }: Props) {
  const cfg = getStatusConfig(status);
  return (
    <span
      className={`inline-flex items-center gap-1.5 font-semibold border rounded-full ${cfg.bg} ${cfg.color} ${
        size === 'sm' ? 'text-[10px] px-2 py-0.5' : 'text-[11px] px-2.5 py-1'
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}
