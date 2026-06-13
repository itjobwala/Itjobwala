'use client';

import { SpecializationGuidance } from '../../types/resume.types';

interface Props {
  data: SpecializationGuidance;
}

// Intentional semantic difficulty level colors
const DIFFICULTY_COLOR: Record<string, string> = {
  'Beginner-Friendly': 'bg-emerald-100 text-emerald-700',
  Moderate:            'bg-amber-100 text-amber-700',
  Intermediate:        'bg-blue-100 text-blue-700',
  Advanced:            'bg-violet-100 text-violet-700',
};

export default function SpecializationUpgradeCard({ data }: Props) {
  return (
    <div className="bg-surface rounded-2xl border border-token p-5 space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h3 className="font-semibold text-heading">Specialization Upgrade</h3>
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${DIFFICULTY_COLOR[data.difficulty] ?? 'bg-surface-hover text-body-secondary'}`}>
          {data.difficulty}
        </span>
      </div>

      <div className="flex items-center gap-2 text-sm">
        <span className="bg-surface-hover text-body-secondary px-2 py-0.5 rounded-full text-xs">{data.current_label}</span>
        <span className="text-gray-300">→</span>
        {/* Intentional blue target role pill */}
        <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs font-medium">{data.transition_target_label}</span>
        <span className="text-subtle text-xs ml-auto">{data.estimated_timeline}</span>
      </div>

      <p className="text-sm text-body-secondary leading-relaxed">{data.gap_description}</p>

      {data.gap_skills.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wide text-subtle">Skills to Add</p>
          <div className="flex flex-wrap gap-2">
            {data.gap_skills.map(s => (
              <span key={s} className="text-xs bg-red-50 text-red-600 border border-red-100 px-2 py-1 rounded-lg">
                {s}
              </span>
            ))}
          </div>
        </div>
      )}

      {data.transition_steps.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wide text-subtle">Transition Steps</p>
          <ol className="space-y-2">
            {data.transition_steps.map((step, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-body">
                {/* Intentional blue step counter */}
                <span className="shrink-0 w-5 h-5 rounded-full bg-blue-50 text-blue-600 text-xs flex items-center justify-center font-medium">
                  {i + 1}
                </span>
                <span className="leading-relaxed">{step}</span>
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Intentional emerald encouragement panel */}
      <div className="bg-emerald-50 rounded-xl p-3">
        <p className="text-xs text-emerald-700 leading-relaxed">{data.encouragement}</p>
      </div>
    </div>
  );
}
