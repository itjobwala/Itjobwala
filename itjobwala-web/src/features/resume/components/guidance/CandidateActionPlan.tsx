'use client';

import { useState } from 'react';
import { ActionPlan } from '../../types/resume.types';

interface Props {
  data: ActionPlan;
}

const PHASES = [
  { key: 'thirty_day_plan'  as const, label: '30 Days', color: 'blue'    },
  { key: 'sixty_day_plan'   as const, label: '60 Days', color: 'violet'  },
  { key: 'ninety_day_plan'  as const, label: '90 Days', color: 'emerald' },
] as const;

// Intentional semantic phase colors (blue/violet/emerald)
const COLOR_MAP = {
  blue:    { tab: 'border-blue-500 text-blue-600', dot: 'bg-blue-500',    badge: 'bg-blue-50 text-blue-700'    },
  violet:  { tab: 'border-violet-500 text-violet-600', dot: 'bg-violet-500',  badge: 'bg-violet-50 text-violet-700'  },
  emerald: { tab: 'border-emerald-500 text-emerald-600', dot: 'bg-emerald-500', badge: 'bg-emerald-50 text-emerald-700' },
} as const;

export default function CandidateActionPlan({ data }: Props) {
  const [activePhase, setActivePhase] = useState<typeof PHASES[number]['key']>('thirty_day_plan');
  const [checked, setChecked] = useState<Set<string>>(new Set());

  const toggle = (key: string) =>
    setChecked(prev => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });

  const active  = PHASES.find(p => p.key === activePhase)!;
  const colors  = COLOR_MAP[active.color];
  const items   = data[activePhase] ?? [];

  return (
    <div className="bg-surface rounded-2xl border border-token p-5 space-y-5">
      <h3 className="font-semibold text-heading">30/60/90 Day Action Plan</h3>

      {/* Phase tabs */}
      <div className="flex border-b border-token">
        {PHASES.map(phase => {
          const c = COLOR_MAP[phase.color];
          const isActive = phase.key === activePhase;
          return (
            <button
              key={phase.key}
              onClick={() => setActivePhase(phase.key)}
              className={`flex-1 py-2 text-sm font-medium border-b-2 transition-colors ${
                isActive
                  ? `${c.tab}`
                  : 'border-transparent text-subtle hover:text-muted'
              }`}
            >
              {phase.label}
            </button>
          );
        })}
      </div>

      {/* Items */}
      <ul className="space-y-3">
        {items.map((item, i) => {
          const key = `${activePhase}-${i}`;
          const done = checked.has(key);
          return (
            <li key={key} className="flex items-start gap-3 cursor-pointer" onClick={() => toggle(key)}>
              <span className={`shrink-0 mt-0.5 w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${
                done ? `${colors.dot} border-transparent` : 'border-token-mid'
              }`}>
                {done && <span className="text-white text-xs leading-none">✓</span>}
              </span>
              <span className={`text-sm leading-relaxed transition-colors ${done ? 'line-through text-subtle' : 'text-body'}`}>
                {item}
              </span>
            </li>
          );
        })}
      </ul>

      {items.length === 0 && (
        <p className="text-sm text-subtle text-center py-4">No actions for this phase.</p>
      )}
    </div>
  );
}
