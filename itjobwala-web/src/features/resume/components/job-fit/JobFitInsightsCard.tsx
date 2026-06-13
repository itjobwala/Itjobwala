'use client';

import type { JobFitResult, FitLevel } from '../../types/resume.types';

interface Props {
  data: JobFitResult;
}

// Intentional semantic fit level colors
const FIT_CONFIG: Record<FitLevel, { bar: string; text: string; bg: string; border: string }> = {
  'Excellent Fit': { bar: 'bg-emerald-500', text: 'text-emerald-700', bg: 'bg-emerald-50',  border: 'border-emerald-200' },
  'Strong Fit':    { bar: 'bg-blue-500',    text: 'text-blue-700',    bg: 'bg-blue-50',     border: 'border-blue-200'    },
  'Partial Fit':   { bar: 'bg-amber-500',   text: 'text-amber-700',   bg: 'bg-amber-50',    border: 'border-amber-200'   },
  'Weak Fit':      { bar: 'bg-orange-500',  text: 'text-orange-700',  bg: 'bg-orange-50',   border: 'border-orange-200'  },
  'Poor Fit':      { bar: 'bg-red-500',     text: 'text-red-700',     bg: 'bg-red-50',      border: 'border-red-200'     },
};

const SPEC_LABEL: Record<string, string> = {
  sdet:           'SDET',
  automation_qa:  'Automation QA',
  api_qa:         'API QA',
  hybrid_qa:      'Hybrid QA',
  performance_qa: 'Performance QA',
  mobile_qa:      'Mobile QA',
  manual_qa:      'Manual QA',
};

export default function JobFitInsightsCard({ data }: Props) {
  const fitLevel = data.fit_level ?? 'Partial Fit';
  const cfg      = FIT_CONFIG[fitLevel] ?? FIT_CONFIG['Partial Fit'];
  const score    = data.job_fit_score ?? 0;

  return (
    <div className={`rounded-2xl border p-5 space-y-4 ${cfg.bg} ${cfg.border}`}>
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-subtle mb-0.5">
            Job-Specific Fit Score
          </p>
          <h3 className="text-sm font-bold text-heading">QA Fit Analysis</h3>
        </div>
        <span className={`text-xs font-bold px-3 py-1 rounded-full border ${cfg.text} ${cfg.bg} ${cfg.border}`}>
          {fitLevel}
        </span>
      </div>

      {/* Score bar */}
      <div className="space-y-1.5">
        <div className="flex items-end justify-between">
          <span className="text-xs text-muted">Fit Score for This Role</span>
          <span className={`text-3xl font-black ${cfg.text}`}>{score}</span>
        </div>
        <div className="h-2.5 bg-white/60 rounded-full overflow-hidden border border-white">
          <div
            className={`h-full rounded-full transition-all ${cfg.bar}`}
            style={{ width: `${score}%` }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-subtle">
          <span>vs your overall QA score: {data.overall_qa_quality}</span>
          <span>{data.tool_overlap_pct}% tool match</span>
        </div>
      </div>

      {/* Context chips */}
      <div className="flex flex-wrap gap-1.5">
        {data.inferred_job_spec && (
          <span className="text-xs bg-white/80 border border-token text-body-secondary px-2 py-0.5 rounded-full">
            Role: {SPEC_LABEL[data.inferred_job_spec] ?? data.inferred_job_spec}
          </span>
        )}
        {data.inferred_job_seniority && (
          <span className="text-xs bg-white/80 border border-token text-body-secondary px-2 py-0.5 rounded-full capitalize">
            Level: {data.inferred_job_seniority.replace('_', ' ')}
          </span>
        )}
        {data.shortlist_prediction && (
          <span className="text-xs bg-white/80 border border-token text-muted px-2 py-0.5 rounded-full">
            Shortlist: {data.shortlist_prediction.split('—')[0].trim()}
          </span>
        )}
      </div>
    </div>
  );
}
