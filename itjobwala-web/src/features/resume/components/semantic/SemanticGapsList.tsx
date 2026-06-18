'use client';

interface Props {
  gaps: string[];
}

export default function SemanticGapsList({ gaps }: Props) {
  if (gaps.length === 0) return null;

  return (
    <div
      className="rounded-2xl px-4 py-3"
      style={{ background: 'rgba(239,68,68,0.04)', border: '1px solid rgba(239,68,68,0.12)' }}
    >
      <div className="flex items-center gap-2 mb-2">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2.5">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
          <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
        <p className="text-[10px] font-bold uppercase tracking-widest text-red-400">
          Semantic Gaps ({gaps.length})
        </p>
      </div>
      <p className="text-[10px] text-slate-500 mb-2.5 leading-relaxed">
        These job concepts are not covered in your resume — even accounting for synonyms.
      </p>
      <div className="flex flex-wrap gap-1.5">
        {gaps.map(gap => (
          <span
            key={gap}
            className="text-[10.5px] font-semibold px-2.5 py-1 rounded-lg"
            style={{ background: 'rgba(239,68,68,0.08)', color: '#fca5a5' }}
          >
            {gap}
          </span>
        ))}
      </div>
    </div>
  );
}
