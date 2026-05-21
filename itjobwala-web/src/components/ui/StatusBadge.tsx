import Badge, { type BadgeVariant, type BadgeSize } from './Badge';

interface StatusConfig {
  label:   string;
  variant: BadgeVariant;
  dot:     string;
}

const STATUS_MAP: Record<string, StatusConfig> = {
  // ── Applicant statuses ────────────────────────────────────────────────────
  applied:       { label: 'Applied',       variant: 'primary',  dot: 'bg-blue-500'   },
  shortlisted:   { label: 'Shortlisted',   variant: 'violet',   dot: 'bg-violet-500' },
  interview:     { label: 'Interview',     variant: 'warning',  dot: 'bg-amber-400'  },
  offer:         { label: 'Offer',         variant: 'indigo',   dot: 'bg-indigo-500' },
  hired:         { label: 'Hired',         variant: 'success',  dot: 'bg-green-500'  },
  selected:      { label: 'Selected',      variant: 'success',  dot: 'bg-green-500'  },
  rejected:      { label: 'Rejected',      variant: 'error',    dot: 'bg-red-500'    },
  withdrawn:     { label: 'Withdrawn',     variant: 'default',  dot: 'bg-gray-400'   },
  // ── Job statuses ──────────────────────────────────────────────────────────
  active:        { label: 'Active',        variant: 'success',  dot: 'bg-green-500'  },
  draft:         { label: 'Draft',         variant: 'yellow',   dot: 'bg-yellow-400' },
  closed:        { label: 'Closed',        variant: 'default',  dot: 'bg-gray-400'   },
  // ── Interview statuses ────────────────────────────────────────────────────
  scheduled:     { label: 'Scheduled',     variant: 'primary',  dot: 'bg-blue-500'   },
  not_scheduled: { label: 'Not Scheduled', variant: 'warning',  dot: 'bg-amber-400'  },
  past:          { label: 'Past',          variant: 'default',  dot: 'bg-gray-400'   },
  completed:     { label: 'Completed',     variant: 'success',  dot: 'bg-green-500'  },
  cancelled:     { label: 'Cancelled',     variant: 'error',    dot: 'bg-red-500'    },
  pending:       { label: 'Pending',       variant: 'warning',  dot: 'bg-amber-400'  },
  reviewed:      { label: 'Reviewed',      variant: 'primary',  dot: 'bg-blue-500'   },
};

const FALLBACK: StatusConfig = { label: '', variant: 'default', dot: 'bg-gray-400' };

interface StatusBadgeProps {
  status:   string;
  size?:    BadgeSize;
  showDot?: boolean;
  className?: string;
}

export default function StatusBadge({ status, size = 'sm', showDot = false, className }: StatusBadgeProps) {
  const cfg   = STATUS_MAP[status] ?? FALLBACK;
  const label = cfg.label || status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, ' ');
  return (
    <Badge variant={cfg.variant} size={size} dot={showDot ? cfg.dot : undefined} className={className}>
      {label}
    </Badge>
  );
}
