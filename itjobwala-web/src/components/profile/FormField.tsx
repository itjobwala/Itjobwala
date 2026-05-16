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
    w-full rounded-xl border text-[13px] font-medium text-[#0f172a]
    px-3.5 py-2.5 outline-none transition-colors
    placeholder:text-gray-400 disabled:bg-gray-50 disabled:text-gray-500
    ${error ? 'border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100' : 'border-gray-200 focus:border-primary/50'}
    ${inputClassName}
  `;

  return (
    <div className={`block ${className}`}>
      <label className="block text-[12px] font-bold text-gray-600 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
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

      {error && <p className="text-[12px] text-red-500 mt-1.5">{error}</p>}
      {maxLength && type === 'textarea' && (
        <p className="text-[11px] text-gray-400 mt-1">{String(value).length}/{maxLength}</p>
      )}
    </div>
  );
}

export function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return (
    <div className="block">
      <span className="block text-[12px] font-bold text-gray-600 mb-2">{label}</span>
      <div className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-[13px] font-medium text-[#0f172a]">
        {value || <span className="text-gray-400">Not provided</span>}
      </div>
    </div>
  );
}
