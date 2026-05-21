'use client';

import { useRecruiterStatsQuery } from '@/src/hooks/useRecruiter';
import Card from '@/src/components/ui/Card';

const STAGE_CONFIGS = [
  { stage: 'applied',     label: 'Applied',     color: 'bg-blue-500',    lightBg: 'bg-blue-50',    text: 'text-blue-700'   },
  { stage: 'shortlisted', label: 'Shortlisted', color: 'bg-violet-500',  lightBg: 'bg-violet-50',  text: 'text-violet-700' },
  { stage: 'interview',   label: 'Interview',   color: 'bg-amber-500',   lightBg: 'bg-amber-50',   text: 'text-amber-700'  },
  { stage: 'offer',       label: 'Offer',       color: 'bg-emerald-500', lightBg: 'bg-emerald-50', text: 'text-emerald-700'},
  { stage: 'hired',       label: 'Hired',       color: 'bg-green-500',   lightBg: 'bg-green-50',   text: 'text-green-700'  },
];

export default function HiringPipeline() {
  const { data, isLoading } = useRecruiterStatsQuery();

  const byStatus = data?.byStatus ?? {};
  const stages = STAGE_CONFIGS.map(cfg => ({
    ...cfg,
    count: byStatus[cfg.stage] ?? 0,
  }));

  const totalApplied = byStatus['applied'] ?? 1;
  const maxCount = Math.max(...stages.map(s => s.count), 1);

  return (
    <Card className="shadow-sm" overflow>
      <div className="mb-5">
        <h2 className="text-[15px] font-extrabold text-[#0f172a]" style={{ letterSpacing: '-0.3px' }}>
          Hiring Pipeline
        </h2>
        <p className="text-[12px] text-gray-400 mt-0.5">Candidate distribution across all stages</p>
      </div>

      {isLoading ? (
        <div className="space-y-3 animate-pulse">
          {STAGE_CONFIGS.map(c => (
            <div key={c.stage} className="h-7 bg-gray-100 rounded-full" />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {stages.map(stage => (
            <div key={stage.stage} className="flex items-center gap-3">
              <div className="w-[88px] shrink-0">
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${stage.lightBg} ${stage.text}`}>
                  {stage.label}
                </span>
              </div>
              <div className="flex-1 h-7 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full ${stage.color} rounded-full flex items-center justify-end pr-2.5 transition-all duration-700 min-w-[40px]`}
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
          ))}
        </div>
      )}

      <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between">
        <div className="text-[12px] text-gray-400">Total in pipeline</div>
        <div className="flex items-center gap-3">
          <span className="text-[12px] text-gray-400">
            Active jobs: <strong className="text-[#0f172a]">{data?.activeJobs ?? '—'}</strong>
          </span>
          <span className="text-[12px] text-gray-400">
            All candidates: <strong className="text-[#0f172a]">{data?.totalApplicants ?? '—'}</strong>
          </span>
        </div>
      </div>
    </Card>
  );
}
