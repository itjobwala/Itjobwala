import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/src/lib/utils/cn';

export type InputSize = 'sm' | 'md';

const SIZE_CLASSES: Record<InputSize, string> = {
  sm: 'px-3 py-2',
  md: 'px-3.5 py-2.5',
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
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
            {leftIcon}
          </div>
        )}

        <input
          ref={ref}
          disabled={disabled || loading}
          aria-invalid={error ? 'true' : 'false'}
          className={cn(
            'w-full rounded-xl border bg-white',
            SIZE_CLASSES[inputSize],
            'text-[13px] font-medium text-[#0f172a]',
            'outline-none transition-colors',
            'placeholder:text-gray-400',
            'disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed',
            error
              ? 'border-red-400 bg-red-50 focus:border-red-400'
              : 'border-gray-200 focus:border-primary',
            hasLeft  && 'pl-9',
            hasRight && 'pr-9',
            className,
          )}
          {...props}
        />

        {hasRight && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
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
