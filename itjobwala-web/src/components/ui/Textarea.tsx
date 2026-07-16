import { forwardRef, type TextareaHTMLAttributes } from 'react';
import { cn } from '@/src/lib/utils/cn';

export type TextareaResize = 'none' | 'y' | 'both';
export type TextareaSize   = 'sm' | 'md';

const RESIZE_CLASSES: Record<TextareaResize, string> = {
  none: 'resize-none',
  y:    'resize-y',
  both: 'resize',
};

const SIZE_CLASSES: Record<TextareaSize, string> = {
  sm: 'px-3 py-2',
  md: 'px-3.5 py-2.5',
};

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
  resize?: TextareaResize;
  inputSize?: TextareaSize;
  showCount?: boolean;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ error, resize = 'none', inputSize = 'md', showCount = false, maxLength, value, className, ...props }, ref) => {
    const charCount = typeof value === 'string' ? value.length : 0;
    const isOver    = maxLength !== undefined && charCount > maxLength;
    const hasError  = !!error || isOver;

    return (
      <div className="w-full">
        <textarea
          ref={ref}
          value={value}
          maxLength={maxLength}
          aria-invalid={hasError ? 'true' : 'false'}
          className={cn(
            'w-full rounded-xl border bg-surface',
            SIZE_CLASSES[inputSize],
            'text-sm font-medium text-heading',
            'outline-none transition-colors leading-relaxed',
            'placeholder:text-muted',
            'disabled:bg-surface-alt disabled:text-subtle disabled:cursor-not-allowed',
            hasError
              ? 'border-danger bg-danger-bg focus:border-danger'
              : 'border-token-mid focus:border-primary',
            RESIZE_CLASSES[resize],
            className,
          )}
          {...props}
        />
        {showCount && maxLength !== undefined && (
          <p className={cn('text-micro mt-1 text-right', isOver ? 'text-danger' : 'text-subtle')}>
            {charCount} / {maxLength}
          </p>
        )}
      </div>
    );
  },
);

Textarea.displayName = 'Textarea';

export default Textarea;
