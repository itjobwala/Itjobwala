'use client';

const STAGE_STYLES: Record<string, { color: string; lightBg: string; text: string }> = {
  applied:     { color: 'bg-blue-500',   lightBg: 'bg-blue-50',   text: 'text-blue-700'   },
  shortlisted: { color: 'bg-violet-500', lightBg: 'bg-violet-50', text: 'text-violet-700' },
  interview:   { color: 'bg-amber-500',  lightBg: 'bg-amber-50',  text: 'text-amber-700'  },
  offer:       { color: 'bg-emerald-500',lightBg: 'bg-emerald-50',text: 'text-emerald-700'},
  hired:       { color: 'bg-green-500',  lightBg: 'bg-green-50',  text: 'text-green-700'  },
  selected:    { color: 'bg-green-500',  lightBg: 'bg-green-50',  text: 'text-green-700'  },
  rejected:    { color: 'bg-red-400',    lightBg: 'bg-red-50',    text: 'text-red-600'    },
};

export default function HiringPipeline() {
  const stages = [
    { stage: 'applied', label: 'Applied', count: 28 },
    { stage: 'shortlisted', label: 'Shortlisted', count: 12 },
    { stage: 'interview', label: 'Interview', count: 8 },
    { stage: 'offer', label: 'Offer', count: 3 },
    { stage: 'hired', label: 'Hired', count: 1 },
  ];
  const stats = { active_jobs: 12, total_applicants: 48 };

  const totalApplied = stages.find(s => s.stage === 'applied')?.count ?? 28;
  const maxCount = Math.max(...stages.map(s => s.count), 1);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <div className="mb-5">
        <h2 className="text-[15px] font-extrabold text-[#0f172a]" style={{ letterSpacing: '-0.3px' }}>
          Hiring Pipeline
        </h2>
        <p className="text-[12px] text-gray-400 mt-0.5">Candidate distribution across all stages</p>
      </div>

      <div className="space-y-3">
          {stages.map(stage => {
            const style = STAGE_STYLES[stage.stage] ?? STAGE_STYLES['applied'];
            const label = stage.label || (stage.stage.charAt(0).toUpperCase() + stage.stage.slice(1));
            return (
              <div key={stage.stage} className="flex items-center gap-3">
                <div className="w-[88px] shrink-0">
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${style.lightBg} ${style.text}`}>
                    {label}
                  </span>
                </div>
                <div className="flex-1 h-7 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${style.color} rounded-full flex items-center justify-end pr-2.5 transition-all duration-700 min-w-[40px]`}
                    style={{ width: `${(stage.count / maxCount) * 100}%` }}
                  >
                    <span className="text-[10px] font-extrabold text-white leading-none">{stage.count}</span>
                  </div>
                </div>
                <div className="w-[36px] text-right shrink-0">
                  <span className="text-[12px] font-bold text-gray-400">
                    {Math.round((stage.count / Math.max(totalApplied, 1)) * 100)}%
                  </span>
                </div>
              </div>
            );
          })}
      </div>

      <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between">
        <div className="text-[12px] text-gray-400">Total in pipeline</div>
        <div className="flex items-center gap-3">
          <span className="text-[12px] text-gray-400">
            Active jobs: <strong className="text-[#0f172a]">{stats?.active_jobs ?? '—'}</strong>
          </span>
          <span className="text-[12px] text-gray-400">
            All candidates: <strong className="text-[#0f172a]">{stats?.total_applicants ?? '—'}</strong>
          </span>
        </div>
      </div>
    </div>
  );
}
