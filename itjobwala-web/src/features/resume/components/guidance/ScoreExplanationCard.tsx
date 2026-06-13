'use client';

import { ScoreExplanations } from '../../types/resume.types';

interface Props {
  data: ScoreExplanations;
  qaMatchScore: number;
}

export default function ScoreExplanationCard({ data, qaMatchScore }: Props) {
  return (
    <div className="bg-surface rounded-2xl border border-token p-5 space-y-5">
      <div>
        <h3 className="font-semibold text-heading mb-1">Score Analysis</h3>
        <p className="text-sm text-muted leading-relaxed">{data.score_summary}</p>
      </div>

      {data.biggest_strengths.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wide text-emerald-600">What's Working</p>
          <ul className="space-y-1.5">
            {data.biggest_strengths.map((s, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-body">
                <span className="text-emerald-500 mt-0.5 shrink-0">✓</span>
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {data.biggest_score_losses.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wide text-amber-600">Score Losses</p>
          <ul className="space-y-1.5">
            {data.biggest_score_losses.map((s, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-body">
                <span className="text-amber-500 mt-0.5 shrink-0">▼</span>
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {data.recruiter_concerns.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wide text-red-500">Recruiter Concerns</p>
          <ul className="space-y-1.5">
            {data.recruiter_concerns.map((s, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-body">
                <span className="text-red-400 mt-0.5 shrink-0">!</span>
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {data.evidence_warnings && data.evidence_warnings.length > 0 && (
        <div className="space-y-2 border-t border-token pt-4">
          <p className="text-xs font-medium uppercase tracking-wide text-violet-600">Evidence Gaps</p>
          <ul className="space-y-2">
            {data.evidence_warnings.map((s, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-body bg-violet-50 rounded-xl px-3 py-2">
                <span className="text-violet-500 mt-0.5 shrink-0 font-bold">◈</span>
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
