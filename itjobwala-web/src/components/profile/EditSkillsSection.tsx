'use client';

import { useState } from 'react';
import { validateSkill } from '@/src/lib/skillValidation';
import { useSkillSuggestions } from '@/src/hooks/useSkillSuggestions';
import { validateSkillsRemote } from '@/src/lib/api/skills';

interface Props {
  skills: string[];
  onChange: (skills: string[]) => void;
}

export default function EditSkillsSection({ skills, onChange }: Props) {
  const [input, setInput] = useState('');
  const [skillError, setSkillError] = useState('');
  const suggestions = useSkillSuggestions(input, skills);

  async function addSkill(skill: string, fromSuggestion = false) {
    const trimmed = skill.trim();
    if (!trimmed) return;
    const error = validateSkill(trimmed);
    if (error) { setSkillError(error); return; }
    if (skills.includes(trimmed)) { setSkillError('Skill already added'); return; }
    if (!fromSuggestion) {
      try {
        const result = await validateSkillsRemote([trimmed]);
        if (!result.valid) {
          setSkillError('Not a recognised skill — please select from suggestions');
          return;
        }
      } catch { /* network error — allow through */ }
    }
    onChange([...skills, trimmed]);
    setInput('');
    setSkillError('');
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-end">
        <span className="text-[12px] font-semibold text-gray-400">{skills.length} skills</span>
      </div>

      {/* Selected skills */}
      {skills.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {skills.map(skill => (
            <span key={skill} className="flex items-center gap-1.5 bg-primary/10 text-primary rounded-xl px-3.5 py-2 border border-primary/20">
              <span className="text-[13px] font-semibold">{skill}</span>
              <button
                type="button"
                onClick={() => onChange(skills.filter(item => item !== skill))}
                className="text-primary/60 hover:text-primary transition-colors"
                aria-label={`Remove ${skill}`}
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Input */}
      <input
        type="text"
        value={input}
        onChange={e => { setInput(e.target.value); setSkillError(''); }}
        onKeyDown={e => {
          if (e.key === 'Enter') { e.preventDefault(); addSkill(input); }
        }}
        placeholder="Type to search skills (e.g. React, Python, Docker)"
        className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-[13px] font-medium text-[#0f172a] outline-none transition-colors placeholder:text-gray-400 ${skillError ? 'border-red-400' : 'border-gray-200 focus:border-primary/50'}`}
      />

      {skillError && (
        <p className="text-[11px] text-red-500 -mt-1">{skillError}</p>
      )}

      {/* Inline suggestions */}
      {suggestions.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {suggestions.map(s => (
            <button
              key={s}
              type="button"
              onClick={() => addSkill(s, true)}
              className="px-2.5 py-1 rounded-lg text-[12px] font-semibold bg-gray-100 text-gray-500 hover:bg-primary/10 hover:text-primary transition-colors"
            >
              + {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
