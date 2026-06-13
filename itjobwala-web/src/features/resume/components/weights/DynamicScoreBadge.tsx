'use client';

interface Props {
  staticScore:   number | null;
  dynamicScore:  number | null;
  scoreDelta:    number | null;
  specialization: string;
  seniorityApplied: string | null;
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

export default function DynamicScoreBadge({
  staticScore, dynamicScore, scoreDelta, specialization, seniorityApplied,
}: Props) {
  if (staticScore == null || dynamicScore == null || scoreDelta == null) return null;

  const positive = scoreDelta >= 0;
  const deltaColor = positive ? '#6ee7b7' : '#fca5a5';
  const deltaSign  = positive ? '+' : '';
  const specLabel  = SPEC_LABEL[specialization] ?? specialization;

  return (
    <div
      className="rounded-2xl px-4 py-4"
      style={{
        background: 'linear-gradient(135deg, rgba(99,102,241,0.12), rgba(6,182,212,0.06))',
        border: '1px solid rgba(99,102,241,0.2)',
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <div
          className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: 'rgba(99,102,241,0.2)' }}
        >
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#a5b4fc" strokeWidth="2.5">
            <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/>
          </svg>
        </div>
        <p className="text-[11px] font-black text-indigo-300">
          {specLabel}-Calibrated Score
        </p>
      </div>

      {/* Score comparison */}
      <div className="flex items-end gap-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-0.5">Base ATS</p>
          <p className="text-[28px] font-black text-slate-400 leading-none">{staticScore}</p>
        </div>

        <div className="pb-1">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(148,163,184,0.3)" strokeWidth="2">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </div>

        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-400 mb-0.5">
            {specLabel} Score
          </p>
          <p className="text-[28px] font-black text-indigo-300 leading-none">{dynamicScore}</p>
        </div>

        <div className="pb-1 ml-auto">
          <div
            className="flex items-center gap-1 px-3 py-1.5 rounded-full"
            style={{
              background: positive ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.1)',
              border: `1px solid ${positive ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.2)'}`,
            }}
          >
            <span className="text-[14px] font-black" style={{ color: deltaColor }}>
              {deltaSign}{scoreDelta}
            </span>
            <span className="text-[10px] font-bold" style={{ color: deltaColor }}>pts</span>
          </div>
        </div>
      </div>

      {/* Footnote */}
      <p className="text-[10px] text-slate-500 mt-2 leading-relaxed">
        {positive
          ? `${specLabel} recruiters weight dimensions that align with your strengths more heavily.`
          : `${specLabel} roles emphasise dimensions where you have room to grow.`}
        {seniorityApplied && ` Seniority adjustment (${seniorityApplied}) applied.`}
      </p>
    </div>
  );
}
