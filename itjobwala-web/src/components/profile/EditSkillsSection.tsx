'use client';

import { useState } from 'react';

interface Props {
  skills: string[];
  onChange: (skills: string[]) => void;
}

const SUGGESTED_SKILLS = ['Playwright', 'Cypress', 'React', 'Node.js', 'SQL', 'Docker', 'AWS', 'Jest', 'GitHub Actions'];

export default function EditSkillsSection({ skills, onChange }: Props) {
  const [input, setInput] = useState('');
  const filtered = SUGGESTED_SKILLS.filter(skill =>
    skill.toLowerCase().includes(input.toLowerCase()) && !skills.includes(skill),
  );

  function addSkill(skill: string) {
    const trimmed = skill.trim();
    if (!trimmed || skills.includes(trimmed)) return;
    onChange([...skills, trimmed]);
    setInput('');
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-end">
        <span className="text-[12px] font-semibold text-gray-400">{skills.length} skills</span>
      </div>

      <div className="flex flex-wrap gap-2.5">
        {skills.map(skill => (
          <span key={skill} className="group flex items-center gap-1.5 bg-primary/10 text-primary rounded-xl px-3.5 py-2 border border-primary/20">
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

      <div className="relative">
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
          placeholder="Add skill"
          className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-[13px] font-medium text-[#0f172a] outline-none transition-colors focus:border-primary/50 placeholder:text-gray-400"
        />

        {input && filtered.length > 0 && (
          <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-20 rounded-xl border border-gray-100 bg-white shadow-xl shadow-black/[0.06] p-1.5">
            {filtered.slice(0, 5).map(skill => (
              <button
                key={skill}
                type="button"
                onClick={() => addSkill(skill)}
                className="w-full text-left rounded-lg px-3 py-2 text-[13px] font-semibold text-gray-600 hover:bg-primary/5 hover:text-primary transition-colors"
              >
                {skill}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
