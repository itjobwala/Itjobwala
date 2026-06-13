'use client';

import type { PoolIntelligence } from '@/features/recruiter/types';

interface Props {
  data: PoolIntelligence;
  jobId: string;
}

const SPEC_LABEL: Record<string, string> = {
  sdet:           'SDET',
  automation_qa:  'Automation QA',
  api_qa:         'API QA',
  mobile_qa:      'Mobile QA',
  performance_qa: 'Performance QA',
  hybrid_qa:      'Hybrid QA',
  manual_qa:      'Manual QA',
  unknown:        'Unknown',
};

const BUCKET_COLORS = ['#22c55e', '#84cc16', '#f59e0b', '#ef4444'];

const CONF_COLOR: Record<string, string> = {
  High:     '#22c55e',
  Moderate: '#f59e0b',
  Low:      '#ef4444',
};

export default function PoolIntelligenceCard({ data }: Props) {
  if (data.total_applicants === 0) {
    return (
      <div
        className="rounded-2xl p-5 text-center"
        style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}
      >
        <p className="text-[12px] text-slate-500">No applicants yet for this job.</p>
      </div>
    );
  }

  const maxBucketCount = Math.max(...data.score_distribution.map(b => b.count), 1);
  const specEntries    = Object.entries(data.specialization_breakdown).sort((a, b) => b[1] - a[1]);
  const totalWithSpec  = specEntries.reduce((sum, [, v]) => sum + v, 0) || 1;

  return (
    <div className="space-y-4">

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total', value: data.total_applicants },
          { label: 'Analysed', value: data.applicants_with_data },
          { label: 'Avg Score', value: data.avg_score != null ? `${data.avg_score}` : '—' },
        ].map(({ label, value }) => (
          <div
            key={label}
            className="rounded-2xl px-3 py-3 text-center"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            <p className="text-[18px] font-black text-slate-200">{value}</p>
            <p className="text-[9.5px] font-bold uppercase tracking-widest text-slate-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Score distribution */}
      {data.applicants_with_data > 0 && (
        <div
          className="rounded-2xl px-4 py-3"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-3">Score Distribution</p>
          <div className="space-y-2.5">
            {data.score_distribution.map((bucket, i) => (
              <div key={bucket.label} className="flex items-center gap-2">
                <span className="text-[9.5px] text-slate-400 w-28 shrink-0">{bucket.label}</span>
                <div className="flex-1 h-2.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${(bucket.count / maxBucketCount) * 100}%`,
                      background: BUCKET_COLORS[i] ?? '#94a3b8',
                    }}
                  />
                </div>
                <span
                  className="text-[10px] font-bold w-4 text-right shrink-0"
                  style={{ color: BUCKET_COLORS[i] ?? '#94a3b8' }}
                >
                  {bucket.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Specialization breakdown */}
      {specEntries.length > 0 && (
        <div
          className="rounded-2xl px-4 py-3"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-3">Specializations</p>
          <div className="space-y-2">
            {specEntries.map(([spec, count]) => (
              <div key={spec} className="flex items-center gap-2">
                <span className="text-[10px] text-slate-400 w-28 shrink-0 truncate">
                  {SPEC_LABEL[spec] ?? spec}
                </span>
                <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${(count / totalWithSpec) * 100}%`, background: 'rgba(99,102,241,0.6)' }}
                  />
                </div>
                <span className="text-[9.5px] text-indigo-300 font-bold w-5 text-right shrink-0">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top candidates */}
      {data.top_candidates.length > 0 && (
        <div
          className="rounded-2xl px-4 py-3"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-3">Top Candidates by Score</p>
          <div className="space-y-2.5">
            {data.top_candidates.map((c, i) => {
              const score = c.qa_match_score ?? 0;
              const color = score >= 80 ? '#22c55e' : score >= 65 ? '#f59e0b' : '#ef4444';
              const confColor = CONF_COLOR[c.recruiter_confidence ?? ''] ?? '#94a3b8';

              return (
                <div key={c.applicant_id} className="flex items-center gap-3">
                  <span
                    className="text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                    style={{ background: 'rgba(255,255,255,0.06)', color: '#94a3b8' }}
                  >
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10.5px] font-semibold text-slate-300">
                        {SPEC_LABEL[c.qa_specialization ?? ''] ?? (c.qa_specialization ?? '—')}
                      </span>
                      <span className="text-[9px] text-slate-500">{c.qa_seniority}</span>
                      {c.recruiter_confidence && (
                        <span
                          className="text-[8.5px] font-bold px-1.5 py-0.5 rounded"
                          style={{ background: `${confColor}15`, color: confColor }}
                        >
                          {c.recruiter_confidence}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="text-[14px] font-black shrink-0" style={{ color }}>
                    {score}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
