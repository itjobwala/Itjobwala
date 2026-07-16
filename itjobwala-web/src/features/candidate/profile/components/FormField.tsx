interface FormFieldProps {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  type?: 'text' | 'email' | 'tel' | 'number' | 'date' | 'textarea';
  placeholder?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  maxLength?: number;
  rows?: number;
  className?: string;
  inputClassName?: string;
}

export function FormField({
  label,
  value,
  onChange,
  type = 'text',
  placeholder = '',
  error,
  required = false,
  disabled = false,
  maxLength,
  rows = 4,
  className = '',
  inputClassName = '',
}: FormFieldProps) {
  const baseInputClasses = `
    w-full rounded-xl border text-sm font-medium text-heading
    px-3.5 py-2.5 outline-none transition-colors
    placeholder:text-muted disabled:bg-surface-alt disabled:text-muted
    ${error ? 'border-danger focus:border-danger focus:ring-2 focus:ring-danger/10' : 'border-token focus:border-primary/50'}
    ${inputClassName}
  `;

  return (
    <div className={`block ${className}`}>
      <label className="block text-caption font-bold text-body-secondary mb-2">
        {label} {required && <span className="text-danger">*</span>}
      </label>

      {type === 'textarea' ? (
        <textarea
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          maxLength={maxLength}
          rows={rows}
          className={baseInputClasses}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          maxLength={maxLength}
          className={baseInputClasses}
        />
      )}

      {error && <p className="text-caption text-danger mt-1.5">{error}</p>}
      {maxLength && type === 'textarea' && (
        <p className="text-micro text-subtle mt-1">{String(value).length}/{maxLength}</p>
      )}
    </div>
  );
}

export function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return (
    <div className="block">
      <span className="block text-caption font-bold text-body-secondary mb-2">{label}</span>
      <div className="w-full rounded-xl border border-token bg-surface-alt px-3.5 py-2.5 text-sm font-medium text-heading">
        {value || <span className="text-subtle">Not provided</span>}
      </div>
    </div>
  );
}
