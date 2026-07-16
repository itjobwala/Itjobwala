import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/src/lib/utils/cn';

export type InputSize = 'sm' | 'md';

// md = design-spec Input Field: 44px mobile -> 48px desktop, 16px font, 14px -> 16px padding
const SIZE_CLASSES: Record<InputSize, string> = {
  sm: 'h-9 px-3 text-[14px]',
  md: 'h-11 lg:h-12 px-3.5 lg:px-4 text-lg',
};

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  loading?: boolean;
  inputSize?: InputSize;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ error, leftIcon, rightIcon, loading, inputSize = 'md', className, disabled, ...props }, ref) => {
    const hasLeft  = !!leftIcon;
    const hasRight = !!rightIcon || loading;

    return (
      <div className="relative w-full">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-subtle pointer-events-none">
            {leftIcon}
          </div>
        )}

        <input
          ref={ref}
          disabled={disabled || loading}
          aria-invalid={error ? 'true' : 'false'}
          className={cn(
            'w-full rounded-sm border bg-surface',
            SIZE_CLASSES[inputSize],
            'font-medium text-heading',
            'outline-none transition-colors',
            'placeholder:text-muted',
            'disabled:bg-surface-alt disabled:text-subtle disabled:cursor-not-allowed',
            error
              ? 'border-danger bg-danger-bg focus:border-danger'
              : 'border-token-mid focus:border-primary',
            hasLeft  && 'pl-9',
            hasRight && 'pr-9',
            className,
          )}
          {...props}
        />

        {hasRight && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-subtle pointer-events-none">
            {loading ? (
              <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              rightIcon
            )}
          </div>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';

export default Input;
