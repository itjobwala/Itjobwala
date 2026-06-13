'use client';

import { cn } from '@/src/lib/utils/cn';

export type ToastVariant = 'success' | 'error' | 'warning' | 'info';

const ICON_WRAP: Record<ToastVariant, string> = {
  success: 'bg-green-700',
  error:   'bg-red-700',
  warning: 'bg-orange-600',
  info:    'bg-blue-700',
};

const OUTER_BG: Record<ToastVariant, string> = {
  success: 'bg-green-600',
  error:   'bg-red-600',
  warning: 'bg-orange-500',
  info:    'bg-blue-600',
};

const ICONS: Record<ToastVariant, React.ReactNode> = {
  success: (
    <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="white" strokeWidth="2.5">
      <path d="M2 6l3 3 5-5" />
    </svg>
  ),
  error: (
    <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="white" strokeWidth="2.5">
      <path d="M1 1l10 10M11 1L1 11" />
    </svg>
  ),
  warning: (
    <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="white" strokeWidth="2.5">
      <path d="M6 1v5M6 9.5v.5" strokeLinecap="round" />
    </svg>
  ),
  info: (
    <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="white" strokeWidth="2.5">
      <path d="M6 5v5M6 2.5v.5" strokeLinecap="round" />
    </svg>
  ),
};

export interface ToastProps {
  message: string;
  variant?: ToastVariant;
  visible: boolean;
  onDismiss?: () => void;
}

export default function Toast({ message, variant = 'success', visible, onDismiss }: ToastProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className={cn(
        'fixed bottom-6 left-1/2 -translate-x-1/2 z-toast transition-all duration-300',
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
      )}
    >
      <div className={cn('flex items-center gap-3 text-white text-sm font-semibold rounded-2xl px-5 py-3.5 shadow-2xl', OUTER_BG[variant])}>
        <span className={cn('w-5 h-5 rounded-full flex items-center justify-center shrink-0', ICON_WRAP[variant])}>
          {ICONS[variant]}
        </span>
        <span>{message}</span>
        {onDismiss && (
          <button
            onClick={onDismiss}
            aria-label="Dismiss"
            className="ml-1 w-5 h-5 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors shrink-0"
          >
            <svg width="8" height="8" viewBox="0 0 8 8" fill="none" stroke="white" strokeWidth="2">
              <path d="M1 1l6 6M7 1L1 7" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
