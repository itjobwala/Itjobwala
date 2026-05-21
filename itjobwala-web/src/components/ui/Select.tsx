import { forwardRef, type SelectHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/src/lib/utils/cn';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectGroup {
  label: string;
  options: SelectOption[];
}

export type SelectSize = 'sm' | 'md';

const SIZE_CLASSES: Record<SelectSize, string> = {
  sm: 'px-3 py-2 pr-8',
  md: 'px-3.5 py-2.5 pr-9',
};

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  error?: string;
  placeholder?: string;
  options?: (SelectOption | SelectGroup)[];
  children?: ReactNode;
  inputSize?: SelectSize;
}

function isGroup(item: SelectOption | SelectGroup): item is SelectGroup {
  return 'options' in item;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ error, placeholder, options, inputSize = 'md', className, children, ...props }, ref) => {
    return (
      <div className="relative w-full">
        <select
          ref={ref}
          aria-invalid={error ? 'true' : 'false'}
          className={cn(
            'w-full appearance-none rounded-xl border bg-white',
            SIZE_CLASSES[inputSize],
            'text-[13px] text-[#0f172a]',
            'outline-none transition-colors cursor-pointer',
            'disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed',
            error
              ? 'border-red-400 bg-red-50 focus:border-red-400'
              : 'border-gray-200 focus:border-primary',
            className,
          )}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}

          {options?.map((item) =>
            isGroup(item) ? (
              <optgroup key={item.label} label={item.label}>
                {item.options.map((opt) => (
                  <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                    {opt.label}
                  </option>
                ))}
              </optgroup>
            ) : (
              <option key={item.value} value={item.value} disabled={item.disabled}>
                {item.label}
              </option>
            ),
          )}

          {/* allow raw <option> / <optgroup> children alongside the options prop */}
          {children}
        </select>

        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400" aria-hidden="true">
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </div>
    );
  },
);

Select.displayName = 'Select';

export default Select;
