'use client';

import { useState } from 'react';
import type { LearningPathItem, LearningInvestment } from '../../types/resume.types';
import SkillLearningCard from './SkillLearningCard';

interface Props {
  learningPath:       LearningPathItem[];
  learningInvestment: LearningInvestment;
}

export default function LearningPathTimeline({ learningPath, learningInvestment }: Props) {
  const [expanded, setExpanded] = useState<number | null>(0);

  if (learningPath.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-8 text-center">
        <div
          className="w-10 h-10 rounded-2xl flex items-center justify-center"
          style={{ background: 'rgba(99,102,241,0.12)' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#a5b4fc" strokeWidth="2">
            <path d="M12 2L2 7l10 5 10-5-10-5z"/>
            <path d="M2 17l10 5 10-5"/>
            <path d="M2 12l10 5 10-5"/>
          </svg>
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-300">No learning path yet</p>
          <p className="text-xs text-slate-500 mt-1">Re-analyze your resume to generate a personalized path.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Investment summary */}
      <div
        className="rounded-2xl px-4 py-3 flex items-center justify-between gap-3"
        style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)' }}
      >
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-400 mb-0.5">
            Learning Investment
          </p>
          <p className="text-[12px] text-slate-300 leading-snug">{learningInvestment.summary}</p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-[22px] font-black text-indigo-300 leading-none">{learningInvestment.estimated_weeks}</p>
          <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">weeks</p>
        </div>
      </div>

      {/* Skill cards */}
      <div className="space-y-2">
        {learningPath.map((item, i) => (
          <SkillLearningCard
            key={item.skill}
            item={item}
            isExpanded={expanded === i}
            onToggle={() => setExpanded(prev => prev === i ? null : i)}
          />
        ))}
      </div>
    </div>
  );
}
