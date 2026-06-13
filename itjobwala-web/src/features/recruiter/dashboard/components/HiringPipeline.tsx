'use client';

import { useRecruiterStatsQuery } from '@/features/recruiter/hooks';
import Card from '@/src/components/ui/Card';

const STAGE_CONFIGS = [
  { stage: 'applied',     label: 'Applied',     color: 'bg-blue-500',   lightBg: 'bg-blue-50',   text: 'text-blue-700'   },
  { stage: 'shortlisted', label: 'Shortlisted', color: 'bg-violet-500', lightBg: 'bg-violet-50', text: 'text-violet-700' },
  { stage: 'interview',   label: 'Interview',   color: 'bg-amber-500',  lightBg: 'bg-amber-50',  text: 'text-amber-700'  },
  { stage: 'hired',       label: 'Hired',       color: 'bg-green-500',  lightBg: 'bg-green-50',  text: 'text-green-700'  },
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
        <h2 className="text-md font-extrabold text-heading" style={{ letterSpacing: '-0.3px' }}>
          Hiring Pipeline
        </h2>
        <p className="text-caption text-subtle mt-0.5">Candidate distribution across all stages</p>
      </div>

      {isLoading ? (
        <div className="space-y-3 animate-pulse">
          {STAGE_CONFIGS.map(c => (
            <div key={c.stage} className="h-7 bg-surface-hover rounded-full" />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {stages.map(stage => (
            <div key={stage.stage} className="flex items-center gap-3">
              <div className="w-[88px] shrink-0">
                <span className={`text-micro font-bold px-2 py-0.5 rounded-full ${stage.lightBg} ${stage.text}`}>
                  {stage.label}
                </span>
              </div>
              <div className="flex-1 h-7 bg-surface-hover rounded-full overflow-hidden">
                <div
                  className={`h-full ${stage.color} rounded-full flex items-center justify-end pr-2.5 transition-all duration-700 min-w-[40px]`}
                  style={{ width: `${(stage.count / maxCount) * 100}%` }}
                >
                  <span className="text-[10px] font-extrabold text-white leading-none">{stage.count}</span>
                </div>
              </div>
              <div className="w-[36px] text-right shrink-0">
                <span className="text-caption font-bold text-subtle">
                  {Math.round((stage.count / Math.max(totalApplied, 1)) * 100)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-5 pt-4 border-t border-token flex items-center justify-between">
        <div className="text-caption text-subtle">Total in pipeline</div>
        <div className="flex items-center gap-3">
          <span className="text-caption text-subtle">
            Active jobs: <strong className="text-heading">{data?.activeJobs ?? '—'}</strong>
          </span>
          <span className="text-caption text-subtle">
            All candidates: <strong className="text-heading">{data?.totalApplicants ?? '—'}</strong>
          </span>
        </div>
      </div>
    </Card>
  );
}
