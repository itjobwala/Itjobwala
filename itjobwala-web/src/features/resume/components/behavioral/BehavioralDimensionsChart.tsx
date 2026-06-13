'use client';

import { useState } from 'react';
import type { BehavioralDimensions } from '../../types/resume.types';

interface Props {
  dimensions: BehavioralDimensions;
}

interface DimConfig {
  key:        keyof BehavioralDimensions;
  label:      string;
  color:      string;
  icon:       string;
  scoreKey:   string;
  detail:     (d: BehavioralDimensions) => React.ReactNode;
}

const DIMS: DimConfig[] = [
  {
    key: 'action_strength',
    label: 'Action Verb Strength',
    color: '#818cf8',
    icon: '⚡',
    scoreKey: 'score',
    detail: d => (
      <div className="space-y-2">
        {d.action_strength.examples.length > 0 && (
          <div>
            <p className="text-[9px] font-bold uppercase tracking-widest text-indigo-400 mb-1">Strong verbs found</p>
            <div className="flex flex-wrap gap-1">
              {d.action_strength.examples.map(v => (
                <span key={v} className="text-[10px] font-semibold px-2 py-0.5 rounded-md"
                  style={{ background: 'rgba(99,102,241,0.12)', color: '#a5b4fc' }}>{v}</span>
              ))}
            </div>
          </div>
        )}
        {d.action_strength.weak_flags.length > 0 && (
          <div>
            <p className="text-[9px] font-bold uppercase tracking-widest text-red-400 mb-1">Weak phrases detected</p>
            {d.action_strength.weak_flags.slice(0, 2).map((f, i) => (
              <p key={i} className="text-[10px] text-red-300 italic">"{f}…"</p>
            ))}
          </div>
        )}
        {d.action_strength.improvement && (
          <p className="text-[10px] text-amber-200 leading-relaxed">{d.action_strength.improvement}</p>
        )}
      </div>
    ),
  },
  {
    key: 'quantification',
    label: 'Quantified Achievements',
    color: '#34d399',
    icon: '#',
    scoreKey: 'score',
    detail: d => (
      <div className="space-y-2">
        <p className="text-[10px] text-slate-400">{d.quantification.count} measurable outcome{d.quantification.count !== 1 ? 's' : ''} detected</p>
        {d.quantification.examples.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {d.quantification.examples.map((e, i) => (
              <span key={i} className="text-[10px] font-bold px-2 py-0.5 rounded-md"
                style={{ background: 'rgba(16,185,129,0.12)', color: '#6ee7b7' }}>{e}</span>
            ))}
          </div>
        )}
        {d.quantification.improvement && (
          <p className="text-[10px] text-amber-200 leading-relaxed">{d.quantification.improvement}</p>
        )}
      </div>
    ),
  },
  {
    key: 'career_trajectory',
    label: 'Career Trajectory',
    color: '#fbbf24',
    icon: '↑',
    scoreKey: 'score',
    detail: d => (
      <div className="space-y-1.5">
        <p className="text-[10px] text-slate-300 leading-relaxed">{d.career_trajectory.explanation}</p>
        {d.career_trajectory.improvement && (
          <p className="text-[10px] text-amber-200 leading-relaxed">{d.career_trajectory.improvement}</p>
        )}
      </div>
    ),
  },
  {
    key: 'leadership',
    label: 'Leadership & Ownership',
    color: '#c084fc',
    icon: '★',
    scoreKey: 'score',
    detail: d => (
      <div className="space-y-2">
        <p className="text-[10px] text-slate-400">Level: <span className="text-slate-200 font-semibold">{d.leadership.level}</span></p>
        {d.leadership.indicators.length > 0 && (
          <div className="space-y-0.5">
            {d.leadership.indicators.map((ind, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <span className="text-purple-400 text-[10px]">✓</span>
                <span className="text-[10px] text-slate-300">{ind}</span>
              </div>
            ))}
          </div>
        )}
        {d.leadership.improvement && (
          <p className="text-[10px] text-amber-200 leading-relaxed">{d.leadership.improvement}</p>
        )}
      </div>
    ),
  },
  {
    key: 'resume_depth',
    label: 'Resume Depth',
    color: '#38bdf8',
    icon: '≡',
    scoreKey: 'score',
    detail: d => (
      <div className="space-y-2">
        <div className="grid grid-cols-3 gap-2 text-center">
          {[
            { label: 'Words',    val: d.resume_depth.word_count },
            { label: 'Projects', val: d.resume_depth.project_count },
            { label: 'Certs',    val: d.resume_depth.cert_count },
          ].map(({ label, val }) => (
            <div key={label} className="rounded-xl py-1.5" style={{ background: 'rgba(255,255,255,0.04)' }}>
              <p className="text-[14px] font-black text-slate-200">{val}</p>
              <p className="text-[8.5px] text-slate-500 uppercase tracking-wide">{label}</p>
            </div>
          ))}
        </div>
        {d.resume_depth.improvement && (
          <p className="text-[10px] text-amber-200 leading-relaxed">{d.resume_depth.improvement}</p>
        )}
      </div>
    ),
  },
];

function getScoreColor(score: number) {
  return score >= 70 ? '#6ee7b7' : score >= 50 ? '#fbbf24' : '#f87171';
}

export default function BehavioralDimensionsChart({ dimensions }: Props) {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}
    >
      <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500 px-4 pt-3 pb-2">
        Behavioral Dimensions
      </p>
      <div className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
        {DIMS.map(dim => {
          const dimData = dimensions[dim.key];
          const score   = (dimData as any).score as number;
          const isOpen  = expanded === dim.key;

          return (
            <div key={dim.key}>
              <button
                className="w-full px-4 py-3 text-left transition-colors hover:bg-white/[0.02]"
                onClick={() => setExpanded(isOpen ? null : dim.key)}
              >
                <div className="flex items-center gap-3">
                  <span className="text-[13px] w-5 text-center" style={{ color: dim.color }}>{dim.icon}</span>
                  <span className="text-[11.5px] font-semibold text-slate-300 flex-1">{dim.label}</span>
                  <div className="flex items-center gap-2 shrink-0">
                    {/* Mini bar */}
                    <div className="w-16 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${score}%`, background: getScoreColor(score) }}
                      />
                    </div>
                    <span className="text-[10px] font-black w-5 text-right" style={{ color: getScoreColor(score) }}>
                      {score}
                    </span>
                    <svg
                      className="transition-transform duration-200"
                      style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                      width="10" height="10" viewBox="0 0 24 24" fill="none"
                      stroke="rgba(148,163,184,0.4)" strokeWidth="2.5"
                    >
                      <polyline points="6 9 12 15 18 9"/>
                    </svg>
                  </div>
                </div>
              </button>
              {isOpen && (
                <div className="px-4 pb-3 pt-1" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                  {dim.detail(dimensions)}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
