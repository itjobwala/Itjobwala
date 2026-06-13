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
          className="block text-sm font-semibold text-body"
        >
          {label}
          {required && <span className="text-red-500 ml-0.5" aria-hidden="true">*</span>}
        </label>
      )}

      {children}

      {error && (
        <p className="text-caption text-red-500" role="alert">
          {error}
        </p>
      )}
      {!error && helper && (
        <p className="text-caption text-subtle">{helper}</p>
      )}
    </div>
  );
}
