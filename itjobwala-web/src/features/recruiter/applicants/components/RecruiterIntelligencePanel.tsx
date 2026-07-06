'use client';

import { useState } from 'react';
import { useApplicantATSIntelligenceQuery, useJobPoolStatsQuery } from '@/features/recruiter/hooks';
import ATSIntelligenceCard  from './ATSIntelligenceCard';
import PoolIntelligenceCard from './PoolIntelligenceCard';

interface Props {
  applicantId: string;
  jobId: string;
}

type Tab = 'candidate' | 'pool';

const TABS: { id: Tab; label: string }[] = [
  { id: 'candidate', label: 'Candidate ATS' },
  { id: 'pool',      label: 'Applicant Pool' },
];

function Skeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map(i => (
        <div key={i} className="h-16 rounded-2xl animate-pulse" style={{ background: 'rgba(255,255,255,0.04)' }} />
      ))}
    </div>
  );
}

export default function RecruiterIntelligencePanel({ applicantId, jobId }: Props) {
  const [tab, setTab] = useState<Tab>('candidate');

  const {
    data: atsData,
    isLoading: atsLoading,
    isError: atsError,
  } = useApplicantATSIntelligenceQuery(applicantId);

  const {
    data: poolData,
    isLoading: poolLoading,
    isError: poolError,
  } = useJobPoolStatsQuery(jobId);

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ background: '#0f1117', border: '1px solid rgba(255,255,255,0.08)' }}
    >
      {/* Header */}
      <div className="px-4 pt-4 pb-0">
        <div className="flex items-center gap-2 mb-3">
          <div
            className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: 'rgba(99,102,241,0.15)' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#a5b4fc" strokeWidth="2.5">
              <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/>
              <polyline points="16 7 22 7 22 13"/>
            </svg>
          </div>
          <div title="General QA capability score — not specific to this job">
            <p className="text-[12px] font-black text-slate-200">ATS Intelligence</p>
            <p className="text-[9.5px] text-slate-500">Powered by dynamic weight engine</p>
          </div>
        </div>

        {/* Tab bar */}
        <div className="flex gap-1 mb-4">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className="px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all"
              style={
                tab === t.id
                  ? { background: 'rgba(99,102,241,0.2)', color: '#a5b4fc' }
                  : { background: 'transparent', color: 'rgba(148,163,184,0.5)' }
              }
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Panel content */}
      <div className="px-4 pb-4">
        {tab === 'candidate' && (
          atsLoading ? <Skeleton /> :
          atsError   ? (
            <div
              className="rounded-2xl p-4 text-center"
              style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.12)' }}
            >
              <p className="text-[11px] text-red-300">Could not load ATS data.</p>
            </div>
          ) :
          atsData ? <ATSIntelligenceCard data={atsData} /> :
          null
        )}

        {tab === 'pool' && (
          poolLoading ? <Skeleton /> :
          poolError   ? (
            <div
              className="rounded-2xl p-4 text-center"
              style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.12)' }}
            >
              <p className="text-[11px] text-red-300">Could not load pool stats.</p>
            </div>
          ) :
          poolData ? <PoolIntelligenceCard data={poolData} jobId={jobId} /> :
          null
        )}
      </div>
    </div>
  );
}
