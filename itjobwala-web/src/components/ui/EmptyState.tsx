import Link from 'next/link';
import { cn } from '@/src/lib/utils/cn';

interface CTAConfig {
  label:    string;
  href?:    string;
  onClick?: () => void;
}

interface EmptyStateProps {
  /** SVG / ReactNode rendered inside a gray rounded icon box. Takes priority over emoji. */
  icon?:        React.ReactNode;
  /** Emoji shorthand — rendered as large text when no icon is provided. */
  emoji?:       string;
  title:        string;
  description?: string;
  cta?:         CTAConfig;
  className?:   string;
}

export default function EmptyState({ icon, emoji, title, description, cta, className }: EmptyStateProps) {
  return (
    <div className={cn('text-center py-12', className)}>
      {icon ? (
        <div className="w-16 h-16 rounded-2xl bg-surface-hover flex items-center justify-center mx-auto mb-5">
          {icon}
        </div>
      ) : emoji ? (
        <div className="text-[40px] mb-4 leading-none">{emoji}</div>
      ) : null}

      <h3 className="text-base font-bold text-heading mb-2">{title}</h3>

      {description && (
        <p className="text-sm text-muted max-w-xs mx-auto">{description}</p>
      )}

      {cta && (
        <div className="mt-5">
          {cta.href ? (
            <Link
              href={cta.href}
              className="inline-block px-5 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl hover:opacity-90 transition-opacity"
            >
              {cta.label}
            </Link>
          ) : (
            <button
              onClick={cta.onClick}
              className="px-5 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl hover:opacity-90 transition-opacity"
            >
              {cta.label}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
