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
            'w-full rounded-xl border bg-white',
            SIZE_CLASSES[inputSize],
            'text-[13px] font-medium text-[#0f172a]',
            'outline-none transition-colors leading-relaxed',
            'placeholder:text-gray-400',
            'disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed',
            hasError
              ? 'border-red-400 bg-red-50 focus:border-red-400'
              : 'border-gray-200 focus:border-primary',
            RESIZE_CLASSES[resize],
            className,
          )}
          {...props}
        />
        {showCount && maxLength !== undefined && (
          <p className={cn('text-[11px] mt-1 text-right', isOver ? 'text-red-500' : 'text-gray-400')}>
            {charCount} / {maxLength}
          </p>
        )}
      </div>
    );
  },
);

Textarea.displayName = 'Textarea';

export default Textarea;
