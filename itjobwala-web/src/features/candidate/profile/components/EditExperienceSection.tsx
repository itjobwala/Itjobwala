'use client';

import { useState } from 'react';
import DateInput from '@/src/components/ui/DateInput';
import { formatDateForInput } from '../utils/profileDate';

export interface EditableExperience {
  id: string;
  company: string;
  role: string;
  title?: string;
  employment_type: string;
  location?: string;
  start_date: string;
  end_date: string;
  is_current: boolean;
  description: string;
  skills: string[];
}

interface Props {
  experiences: EditableExperience[];
  onChange: (experiences: EditableExperience[]) => void;
  onDelete?: (id: string | number) => void;
}

function emptyExperience(): EditableExperience {
  return {
    id: `exp-${Date.now()}`,
    company: '',
    role: '',
    employment_type: 'Full-time',
    location: '',
    start_date: '',
    end_date: '',
    is_current: false,
    description: '',
    skills: [],
  };
}

function TextField({
  label,
  value,
  onChange,
  type = 'text',
  disabled = false,
  placeholder = '',
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  disabled?: boolean;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="block text-[12px] font-bold text-gray-500 mb-1.5">{label}</span>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        disabled={disabled}
        placeholder={placeholder}
        className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-[13px] font-medium outline-none transition-colors placeholder:text-gray-400 ${
          disabled
            ? 'border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed'
            : 'border-gray-200 text-[#0f172a] focus:border-primary/50'
        }`}
      />
    </label>
  );
}


function SkillInput({ skills, onChange }: { skills: string[], onChange: (skills: string[]) => void }) {
  const [input, setInput] = useState('');
  function addSkill(skill: string) {
    const trimmed = skill.trim();
    if (!trimmed || skills.includes(trimmed)) return;
    onChange([...skills, trimmed]);
    setInput('');
  }
  return (
    <div className="block mt-3">
      <span className="block text-[12px] font-bold text-gray-500 mb-1.5">Skills used</span>
      {skills.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {skills.map(skill => (
            <span key={skill} className="group flex items-center gap-1.5 bg-primary/10 text-primary rounded-xl px-2.5 py-1.5 border border-primary/20">
              <span className="text-[12px] font-semibold">{skill}</span>
              <button
                type="button"
                onClick={() => onChange(skills.filter(s => s !== skill))}
                className="text-primary/60 hover:text-primary transition-colors"
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </span>
          ))}
        </div>
      )}
      <input
        type="text"
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={e => {
          if (e.key === 'Enter') {
            e.preventDefault();
            addSkill(input);
          }
        }}
        placeholder="Add skill and press Enter"
        className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-[13px] font-medium text-[#0f172a] outline-none transition-colors focus:border-primary/50 placeholder:text-gray-400"
      />
    </div>
  );
}

export default function EditExperienceSection({ experiences, onChange, onDelete }: Props) {
  function update(id: string, patch: Partial<EditableExperience>) {
    onChange(experiences.map(item => (item.id === id ? { ...item, ...patch } : item)));
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => onChange([...experiences, emptyExperience()])}
          className="flex items-center gap-1.5 text-[12px] font-semibold text-gray-400 hover:text-primary transition-colors"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="12" cy="12" r="10" /><path d="M12 8v8M8 12h8" />
          </svg>
          Add experience
        </button>
      </div>

      <div className="flex flex-col gap-4">
        {experiences.map(exp => (
          <div key={exp.id} className="rounded-2xl border border-gray-100 bg-gray-50 p-4 hover:border-primary/20 transition-colors">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <TextField label="Company" value={exp.company} onChange={value => update(exp.id, { company: value })} placeholder="e.g. Google" />
              <TextField label="Role" value={exp.role} onChange={value => update(exp.id, { role: value })} placeholder="e.g. Senior Software Engineer" />
              <label className="block">
                <span className="block text-[12px] font-bold text-gray-500 mb-1.5">Employment type</span>
                <select
                  value={exp.employment_type}
                  onChange={e => update(exp.id, { employment_type: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-[13px] font-medium text-[#0f172a] outline-none transition-colors focus:border-primary/50"
                >
                  <option>Full-time</option>
                  <option>Part-time</option>
                  <option>Contract</option>
                  <option>Internship</option>
                </select>
              </label>
              <TextField label="Location" value={exp.location || ''} onChange={value => update(exp.id, { location: value })} placeholder="e.g. Bengaluru, India" />
              <div className="grid grid-cols-2 gap-3">
                <DateInput label="Start date" value={formatDateForInput(exp.start_date)} onChange={value => update(exp.id, { start_date: value })} />
                <DateInput label="End date" value={formatDateForInput(exp.end_date)} onChange={value => update(exp.id, { end_date: value })} disabled={exp.is_current} />
              </div>
            </div>

            <label className="mt-3 flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={exp.is_current ?? false}
                onChange={e => update(exp.id, { is_current: e.target.checked, end_date: e.target.checked ? '' : exp.end_date })}
                className="h-4 w-4 rounded border-gray-300 text-primary accent-primary"
              />
              <span className="text-[13px] font-semibold text-gray-600">I currently work here</span>
            </label>

            <label className="block mt-3">
              <span className="block text-[12px] font-bold text-gray-500 mb-1.5">Description</span>
              <textarea
                value={exp.description}
                onChange={e => update(exp.id, { description: e.target.value })}
                rows={4}
                className="w-full resize-none rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-[13px] leading-[1.7] text-gray-700 outline-none transition-colors focus:border-primary/50 placeholder:text-gray-400"
              />
            </label>

            <SkillInput skills={exp.skills || []} onChange={skills => update(exp.id, { skills })} />

            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={() => onDelete ? onDelete(exp.id) : onChange(experiences.filter(item => item.id !== exp.id))}
                className="text-[12px] font-semibold text-red-500 hover:text-red-600 transition-colors"
              >
                Remove experience
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
