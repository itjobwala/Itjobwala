'use client';

interface Props {
  strongBehaviors: string[];
  weakBehaviors:   string[];
  topFix:          string;
}

export default function BehavioralSignalsCard({ strongBehaviors, weakBehaviors, topFix }: Props) {
  return (
    <div className="space-y-3">
      {/* Top behavioral fix */}
      <div
        className="rounded-2xl px-4 py-3 flex gap-2.5"
        style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)' }}
      >
        <svg className="shrink-0 mt-0.5" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="2.5">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
        </svg>
        <div>
          <p className="text-[9.5px] font-black uppercase tracking-widest text-amber-400 mb-1">Highest-Impact Fix</p>
          <p className="text-[11px] text-amber-200 leading-relaxed">{topFix}</p>
        </div>
      </div>

      {/* Strong signals */}
      {strongBehaviors.length > 0 && (
        <div
          className="rounded-2xl px-4 py-3"
          style={{ background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.12)' }}
        >
          <p className="text-[9.5px] font-bold uppercase tracking-widest text-emerald-400 mb-2">Behavioral Strengths</p>
          <ul className="space-y-1">
            {strongBehaviors.map((s, i) => (
              <li key={i} className="flex items-start gap-2 text-[11px] text-emerald-200">
                <span className="shrink-0 text-emerald-400 mt-0.5">✓</span>
                {s}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Weak signals */}
      {weakBehaviors.length > 0 && (
        <div
          className="rounded-2xl px-4 py-3"
          style={{ background: 'rgba(239,68,68,0.04)', border: '1px solid rgba(239,68,68,0.12)' }}
        >
          <p className="text-[9.5px] font-bold uppercase tracking-widest text-red-400 mb-2">Areas to Strengthen</p>
          <ul className="space-y-1">
            {weakBehaviors.map((w, i) => (
              <li key={i} className="flex items-start gap-2 text-[11px] text-red-300">
                <span className="shrink-0 text-red-400 mt-0.5">→</span>
                {w}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
