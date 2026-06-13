'use client';

import type { ResumeVersionSnapshot } from '../../types/resume.types';

interface Props {
  versions: ResumeVersionSnapshot[];
}

const SPEC_LABEL: Record<string, string> = {
  sdet:           'SDET',
  automation_qa:  'Automation QA',
  api_qa:         'API QA',
  mobile_qa:      'Mobile QA',
  performance_qa: 'Performance QA',
  hybrid_qa:      'Hybrid QA',
  manual_qa:      'Manual QA',
};

function scoreColor(score: number | null): string {
  if (score == null) return '#94a3b8';
  if (score >= 80)   return '#10b981';
  if (score >= 65)   return '#06b6d4';
  if (score >= 50)   return '#f59e0b';
  return '#ef4444';
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function VersionHistoryList({ versions }: Props) {
  const reversed = [...versions].reverse();

  return (
    <div className="space-y-2">
      <p
        className="text-[10px] font-bold uppercase tracking-[0.15em] px-1"
        style={{ color: 'rgba(148,163,184,0.5)' }}
      >
        All Analyzes
      </p>
      {reversed.map((v, i) => {
        const isLatest = i === 0;
        const color    = scoreColor(v.qa_match_score);
        return (
          <div
            key={v.id}
            className="rounded-2xl px-4 py-3 flex items-center gap-3"
            style={{
              background: isLatest ? 'rgba(99,102,241,0.08)' : 'rgba(255,255,255,0.03)',
              border: isLatest ? '1px solid rgba(99,102,241,0.2)' : '1px solid rgba(255,255,255,0.06)',
            }}
          >
            {/* Version badge */}
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-[10px] font-black"
              style={{ background: `${color}18`, color, border: `1px solid ${color}30` }}
            >
              v{v.version_number}
            </div>

            {/* Details */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[13px] font-black" style={{ color }}>
                  {v.qa_match_score ?? '—'}
                </span>
                <span className="text-[10px] text-slate-500">QA score</span>
                {isLatest && (
                  <span
                    className="text-[8.5px] font-black px-1.5 py-0.5 rounded-full"
                    style={{ background: 'rgba(99,102,241,0.2)', color: '#a5b4fc' }}
                  >
                    Latest
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                {v.qa_specialization && (
                  <span className="text-[10px] text-slate-400">
                    {SPEC_LABEL[v.qa_specialization] ?? v.qa_specialization}
                  </span>
                )}
                {v.qa_seniority && (
                  <>
                    <span className="text-slate-700">·</span>
                    <span className="text-[10px] text-slate-500 capitalize">{v.qa_seniority}</span>
                  </>
                )}
              </div>
            </div>

            {/* Right side */}
            <div className="text-right shrink-0">
              <p className="text-[10px] text-slate-400">{formatDate(v.parsed_at)}</p>
              <p className="text-[9.5px] text-slate-600 mt-0.5">{v.skills_count} skills</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
