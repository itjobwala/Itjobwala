'use client';

import { useRef } from 'react';

function formatDateForInput(dateStr?: string | null): string {
  if (!dateStr) return '';
  return dateStr.slice(0, 10);
}

export interface EditableEducation {
  id: string;
  institution: string;
  degree: string;
  field_of_study: string;
  location?: string;
  start_date: string;
  end_date: string;
  grade: string;
  is_current: boolean;
}

interface Props {
  education: EditableEducation[];
  onChange: (education: EditableEducation[]) => void;
  onDelete?: (id: string | number) => void;
}

function emptyEducation(): EditableEducation {
  return { id: `edu-${Date.now()}`, institution: '', degree: '', field_of_study: '', location: '', start_date: '', end_date: '', grade: '', is_current: false };
}

function TextField({ label, value, onChange, type = 'text', placeholder = '', disabled = false }: { label: string; value: string; onChange: (value: string) => void; type?: string; placeholder?: string; disabled?: boolean }) {
  return (
    <label className="block">
      <span className="block text-[12px] font-bold text-gray-500 mb-1.5">{label}</span>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-[13px] font-medium outline-none transition-colors placeholder:text-gray-400 ${
          disabled
            ? 'border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed'
            : 'border-gray-200 text-[#0f172a] focus:border-primary/50'
        }`}
      />
    </label>
  );
}

function DateInput({ label, value, onChange, disabled = false }: { label: string; value: string; onChange: (v: string) => void; disabled?: boolean }) {
  const hiddenRef = useRef<HTMLInputElement>(null);
  return (
    <label className="block">
      <span className="block text-[12px] font-bold text-gray-500 mb-1.5">{label}</span>
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder="YYYY-MM-DD"
          disabled={disabled}
          className={`w-full rounded-xl border bg-white px-3.5 py-2.5 pr-10 text-[13px] font-medium outline-none transition-colors placeholder:text-gray-400 ${
            disabled ? 'border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed' : 'border-gray-200 text-[#0f172a] focus:border-primary/50'
          }`}
        />
        {!disabled && (
          <button
            type="button"
            onClick={() => hiddenRef.current?.showPicker?.()}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary transition-colors"
          >
            <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <path d="M16 2v4M8 2v4M3 10h18" />
            </svg>
          </button>
        )}
        <input
          ref={hiddenRef}
          type="date"
          value={value}
          onChange={e => onChange(e.target.value)}
          tabIndex={-1}
          className="absolute opacity-0 w-0 h-0 pointer-events-none"
        />
      </div>
    </label>
  );
}

export default function EditEducationSection({ education, onChange, onDelete }: Props) {
  function update(id: string, patch: Partial<EditableEducation>) {
    onChange(education.map(item => (item.id === id ? { ...item, ...patch } : item)));
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => onChange([...education, emptyEducation()])}
          className="flex items-center gap-1.5 text-[12px] font-semibold text-gray-400 hover:text-primary transition-colors"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="12" cy="12" r="10" /><path d="M12 8v8M8 12h8" />
          </svg>
          Add education
        </button>
      </div>

      <div className="flex flex-col gap-4">
        {education.map(item => (
          <div key={item.id} className="rounded-2xl border border-gray-100 bg-gray-50 p-4 hover:border-primary/20 transition-colors">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <TextField label="Institution" value={item.institution || ''} onChange={value => update(item.id, { institution: value })} placeholder="e.g. Stanford University" />
              <TextField label="Degree" value={item.degree || ''} onChange={value => update(item.id, { degree: value })} placeholder="e.g. Bachelor of Science" />
              <TextField label="Field of study" value={item.field_of_study || ''} onChange={value => update(item.id, { field_of_study: value })} placeholder="e.g. Computer Science" />
              <TextField label="Location" value={item.location || ''} onChange={value => update(item.id, { location: value })} placeholder="e.g. San Francisco, CA" />
              <TextField label="Grade / GPA" value={item.grade || ''} onChange={value => update(item.id, { grade: value })} placeholder="e.g. 3.8/4.0" />
              <div className="grid grid-cols-2 gap-3 sm:col-span-2">
                <DateInput label="Start date" value={formatDateForInput(item.start_date)} onChange={value => update(item.id, { start_date: value })} />
                <DateInput
                  label="End date"
                  value={formatDateForInput(item.end_date)}
                  onChange={value => update(item.id, {
                    end_date: value,
                    is_current: value ? false : item.is_current
                  })}
                  disabled={item.is_current}
                />
              </div>
            </div>

            <label className="mt-3 flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={item.is_current ?? false}
                onChange={e => update(item.id, { is_current: e.target.checked, end_date: e.target.checked ? '' : item.end_date })}
                className="h-4 w-4 rounded border-gray-300 text-primary accent-primary"
              />
              <span className="text-[13px] font-semibold text-gray-600">I am currently pursuing this</span>
            </label>

            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={() => onDelete ? onDelete(item.id) : onChange(education.filter(ed => ed.id !== item.id))}
                className="text-[12px] font-semibold text-red-500 hover:text-red-600 transition-colors"
              >
                Remove education
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
