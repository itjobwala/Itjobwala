'use client';

import Link from 'next/link';
import { useTopCandidatesQuery } from '@/features/recruiter/hooks';
import Card from '@/src/components/ui/Card';

function ScoreBadge({ score }: { score: number }) {
  const bg    = score >= 70 ? 'rgba(16,185,129,0.1)'  : score >= 50 ? 'rgba(245,158,11,0.1)'  : 'rgba(239,68,68,0.08)';
  const color = score >= 70 ? '#10b981'                : score >= 50 ? '#f59e0b'                : '#ef4444';
  return (
    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full" style={{ background: bg, color }}>
      {score}
    </span>
  );
}

export default function TopCandidatesCard() {
  const { data, isLoading } = useTopCandidatesQuery(3);
  const candidates = data?.candidates ?? [];

  return (
    <Card padding="none" className="shadow-sm h-[350px] flex flex-col overflow-hidden">
      <div className="px-5 py-4 border-b border-token flex items-center justify-between">
        <div>
          <h2 className="text-h6 text-heading" style={{ letterSpacing: '-0.3px' }}>
            Top Candidates
          </h2>
          <p className="text-caption text-subtle mt-0.5">Highest ATS-scored active applicants</p>
        </div>
        {candidates.length > 0 && (
          <Link
            href="/recruiter/applicants?sortBy=qaScore"
            className="text-[12px] font-bold text-primary hover:text-primary/80 transition-colors"
          >
            View all →
          </Link>
        )}
      </div>

      {isLoading ? (
        <div className="px-5 py-8 text-center text-sm text-subtle animate-pulse">Loading…</div>
      ) : candidates.length === 0 ? (
        <div className="px-5 py-8 text-center text-sm text-subtle">No scored applicants yet.</div>
      ) : (
        <ul className="divide-y divide-token">
          {candidates.map(c => (
            <li key={c.id} className="px-5 py-3 flex items-center gap-3 hover:bg-surface-alt transition-colors">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-primary/10 text-primary font-bold text-sm shrink-0">
                {c.candidateName.substring(0, 2).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-heading truncate">{c.candidateName}</p>
                <p className="text-caption text-muted truncate">{c.jobTitle}</p>
                {c.topSkills.length > 0 && (
                  <p className="text-[10px] text-subtle mt-0.5 truncate">{c.topSkills.join(' · ')}</p>
                )}
              </div>
              <div className="flex flex-col items-end gap-1 shrink-0">
                <ScoreBadge score={c.qaMatchScore} />
                {c.careerLevel && (
                  <span className="text-[10px] text-subtle capitalize">{c.careerLevel}</span>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
