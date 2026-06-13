import type { ReactNode } from 'react';
import { cn } from '@/src/lib/utils/cn';

interface Props {
  title?: string;
  subtitle?: string;
  backLabel?: string;
  onBack?: () => void;
  actions?: ReactNode;
  className?: string;
}

export default function PageHeader({
  title,
  subtitle,
  backLabel,
  onBack,
  actions,
  className,
}: Props) {
  return (
    <div className={cn('space-y-4', className)}>
      {(backLabel || onBack) && (
        <button
          type="button"
          onClick={onBack}
          className="text-sm text-muted hover:text-primary font-medium transition-colors flex items-center gap-1"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
          {backLabel}
        </button>
      )}

      {(title || actions) && (
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          {title && (
            <div>
              <h1
                className="text-4xl font-extrabold text-heading"
                style={{ letterSpacing: '-0.5px' }}
              >
                {title}
              </h1>
              {subtitle && (
                <p className="text-sm text-muted mt-1">{subtitle}</p>
              )}
            </div>
          )}
          {actions && <div className="flex gap-2 shrink-0">{actions}</div>}
        </div>
      )}
    </div>
  );
}
