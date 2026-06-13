'use client';

interface Props {
  semanticScore:  number;
  rawSimilarity:  number;
  skillsCoverage: number;
}

function MiniRing({ value, color, label }: { value: number; color: string; label: string }) {
  const r   = 18;
  const cx  = 22;
  const circ = 2 * Math.PI * r;
  return (
    <div className="flex flex-col items-center gap-1">
      <svg width="44" height="44" viewBox="0 0 44 44">
        <circle cx={cx} cy={cx} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="4" />
        <circle
          cx={cx} cy={cx} r={r} fill="none"
          stroke={color} strokeWidth="4"
          strokeDasharray={circ}
          strokeDashoffset={circ * (1 - value / 100)}
          strokeLinecap="round"
          transform={`rotate(-90 ${cx} ${cx})`}
        />
        <text x={cx} y={cx + 4} textAnchor="middle" fill={color} fontSize="9" fontWeight="800">{value}</text>
      </svg>
      <span className="text-[9px] text-slate-500 text-center leading-tight">{label}</span>
    </div>
  );
}

export default function SemanticScoreRing({ semanticScore, rawSimilarity, skillsCoverage }: Props) {
  const r    = 40;
  const cx   = 52;
  const circ = 2 * Math.PI * r;

  const color =
    semanticScore >= 75 ? '#6ee7b7' :
    semanticScore >= 55 ? '#fbbf24' :
    semanticScore >= 35 ? '#fb923c' :
    '#f87171';

  const label =
    semanticScore >= 75 ? 'Strong Match' :
    semanticScore >= 55 ? 'Moderate Match' :
    semanticScore >= 35 ? 'Partial Match' :
    'Low Alignment';

  return (
    <div
      className="rounded-2xl px-4 py-4"
      style={{
        background: 'linear-gradient(135deg, rgba(99,102,241,0.08), rgba(6,182,212,0.04))',
        border: '1px solid rgba(99,102,241,0.15)',
      }}
    >
      <div className="flex items-center gap-5">
        {/* Main ring */}
        <div className="relative shrink-0">
          <svg width="104" height="104" viewBox="0 0 104 104">
            <circle cx={cx} cy={cx} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
            <circle
              cx={cx} cy={cx} r={r} fill="none"
              stroke={color} strokeWidth="8"
              strokeDasharray={circ}
              strokeDashoffset={circ * (1 - semanticScore / 100)}
              strokeLinecap="round"
              transform={`rotate(-90 ${cx} ${cx})`}
            />
            <text x={cx} y={cx - 5} textAnchor="middle" fill={color} fontSize="22" fontWeight="900">{semanticScore}</text>
            <text x={cx} y={cx + 12} textAnchor="middle" fill="rgba(148,163,184,0.6)" fontSize="8" fontWeight="700">SEMANTIC</text>
          </svg>
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-black text-slate-200 mb-0.5">{label}</p>
          <p className="text-[10px] text-slate-500 leading-relaxed mb-3">
            Beyond keywords — how well your resume language aligns with this job's intent.
          </p>
          <div className="flex gap-4">
            <MiniRing value={rawSimilarity}  color="#818cf8" label="Text Sim" />
            <MiniRing value={skillsCoverage} color="#34d399" label="Coverage" />
          </div>
        </div>
      </div>
    </div>
  );
}
