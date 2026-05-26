'use client';

import Card    from '@/src/components/ui/Card';
import Badge   from '@/src/components/ui/Badge';
import { useJobMatchQuery } from '../hooks';
import { getScoreColor, getScoreLabel, BAND_COLORS } from '../utils/scoreColor';

interface Props {
  jobId: number;
}

export default function ResumeMatchCard({ jobId }: Props) {
  const { data, isLoading, isError } = useJobMatchQuery(jobId);

  if (isLoading) {
    return (
      <Card padding="md">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-100 rounded w-1/2" />
          <div className="h-16 bg-gray-100 rounded" />
        </div>
      </Card>
    );
  }

  if (isError || !data || data.overall_score === null) {
    return null;
  }

  const color    = getScoreColor(data.overall_score);
  const label    = getScoreLabel(data.overall_score);
  const colors   = BAND_COLORS[color];

  return (
    <Card padding="md" className="border border-indigo-100 bg-gradient-to-br from-white to-indigo-50/30">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" strokeWidth="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
        </div>
        <div>
          <p className="text-[13px] font-bold text-gray-900">Your Match Score</p>
          <p className="text-[11px] text-gray-400">Based on your resume analysis</p>
        </div>
        <div className="ml-auto">
          <span className={`text-2xl font-black ${colors.text}`}>{data.overall_score}%</span>
        </div>
      </div>

      {/* Score bar */}
      <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden mb-3">
        <div
          className={`h-full rounded-full transition-all duration-700 ${colors.bar}`}
          style={{ width: `${data.overall_score}%` }}
        />
      </div>

      <div className={`text-[12px] font-semibold ${colors.text} mb-4`}>{label} — {data.recommendation}</div>

      {/* Matched / Missing skills */}
      {data.matched_skills.length > 0 && (
        <div className="mb-3">
          <p className="text-[11px] text-gray-400 font-medium mb-1.5">Matching Skills</p>
          <div className="flex flex-wrap gap-1">
            {data.matched_skills.map(s => (
              <Badge key={s} variant="emerald" size="sm" rounded="md">{s}</Badge>
            ))}
          </div>
        </div>
      )}

      {data.missing_skills.length > 0 && (
        <div>
          <p className="text-[11px] text-gray-400 font-medium mb-1.5">Missing Skills</p>
          <div className="flex flex-wrap gap-1">
            {data.missing_skills.slice(0, 6).map(s => (
              <Badge key={s} variant="error" size="sm" rounded="md">+ {s}</Badge>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
