import type { ReactNode } from 'react';
import { cn } from '@/src/lib/utils/cn';

export interface FormFieldProps {
  label?: string;
  htmlFor?: string;
  required?: boolean;
  error?: string;
  helper?: string;
  children: ReactNode;
  className?: string;
}

export default function FormField({
  label,
  htmlFor,
  required = false,
  error,
  helper,
  children,
  className,
}: FormFieldProps) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label && (
        <label
          htmlFor={htmlFor}
          className="block text-[13px] font-semibold text-gray-700"
        >
          {label}
          {required && <span className="text-red-500 ml-0.5" aria-hidden="true">*</span>}
        </label>
      )}

      {children}

      {error && (
        <p className="text-[12px] text-red-500" role="alert">
          {error}
        </p>
      )}
      {!error && helper && (
        <p className="text-[12px] text-gray-400">{helper}</p>
      )}
    </div>
  );
}
