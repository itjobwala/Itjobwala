'use client';

import Card  from '@/src/components/ui/Card';
import Badge from '@/src/components/ui/Badge';
import { useJobMatchQuery } from '../hooks';

interface Props {
  jobId: number;
}

export default function ResumeMatchCard({ jobId }: Props) {
  const { data, isLoading, isError } = useJobMatchQuery(jobId);

  if (isLoading) {
    return (
      <Card padding="md">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-surface-hover rounded w-1/2" />
          <div className="h-16 bg-surface-hover rounded" />
        </div>
      </Card>
    );
  }

  if (isError || !data || data.overall_score === null) return null;

  const score    = data.overall_score;
  const isDomain = data.domain_match;

  const { bar, text, label } = getScoreStyle(score);

  return (
    <Card padding="md" className="border border-indigo-100">
      {/* Intentional brand gradient background */}
      <div
        className="rounded-2xl px-4 py-4"
        style={{ background: 'linear-gradient(135deg, #fafbff 0%, #f0f4ff 100%)' }}
      >
        {/* Header */}
        <div className="flex items-start gap-3 mb-4">
          {/* Score ring — intentional indigo brand */}
          <div className="relative shrink-0">
            <svg width="52" height="52" viewBox="0 0 52 52">
              <defs>
                <linearGradient id={`match-grad-${jobId}`} x1="0" y1="0" x2="52" y2="52" gradientUnits="userSpaceOnUse">
                  <stop offset="0%"   stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#06b6d4" />
                </linearGradient>
              </defs>
              <circle cx="26" cy="26" r="21" fill="none" stroke="#eef2ff" strokeWidth="5" />
              <circle
                cx="26" cy="26" r="21"
                fill="none"
                stroke={`url(#match-grad-${jobId})`}
                strokeWidth="5"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 21 * score / 100} ${2 * Math.PI * 21}`}
                transform="rotate(-90 26 26)"
                style={{ filter: 'drop-shadow(0 0 4px rgba(99,102,241,0.4))' }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-caption font-black text-indigo-600">{score}%</span>
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-heading">
              {isDomain ? 'QA Profile Match' : 'QA Fit Score'}
            </p>
            <p className="text-micro text-subtle mt-0.5">
              {isDomain
                ? 'Your QA skills align with this role'
                : 'Based on your QA skills & profile'}
            </p>
            <span
              className={`inline-block mt-1.5 text-micro font-bold px-2 py-0.5 rounded-md ${text}`}
              style={{ background: `${text === 'text-indigo-600' ? '#eef2ff' : text === 'text-emerald-600' ? '#d1fae5' : '#fef9c3'}` }}
            >
              {label}
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-1.5 bg-surface-hover rounded-full overflow-hidden mb-3">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${score}%`, background: bar }}
          />
        </div>

        {/* Recommendation */}
        <p className="text-caption text-body-secondary mb-3 leading-relaxed">
          {data.recommendation}
        </p>

        {/* Domain mismatch notice — intentional amber status */}
        {!isDomain && data.resume_domain && data.job_domain && (
          <div className="mb-3 flex items-start gap-2 px-3 py-2 bg-amber-50 border border-amber-100 rounded-xl">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2.5" className="shrink-0 mt-px">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
            <p className="text-[10.5px] text-amber-700 leading-snug">
              Your profile is <strong>{data.resume_domain.replace(/_/g, ' ')}</strong> — this role expects <strong>{data.job_domain.replace(/_/g, ' ')}</strong>.
            </p>
          </div>
        )}

        {/* Matched skills */}
        {data.matched_skills.length > 0 && (
          <div className="mb-3">
            <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider mb-1.5">
              Matching Skills
            </p>
            <div className="flex flex-wrap gap-1">
              {data.matched_skills.map(s => (
                <Badge key={s} variant="emerald" size="sm" rounded="md">{s}</Badge>
              ))}
            </div>
          </div>
        )}

        {/* Missing skills */}
        {data.missing_skills.length > 0 && (
          <div>
            <p className="text-[10px] font-bold text-red-400 uppercase tracking-wider mb-1.5">
              Skill Gaps
            </p>
            <div className="flex flex-wrap gap-1">
              {data.missing_skills.slice(0, 6).map(s => (
                <Badge key={s} variant="error" size="sm" rounded="md">+ {s}</Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

// Score-band colors are intentional visual indicators
function getScoreStyle(score: number) {
  if (score >= 80) return {
    bar:   'linear-gradient(90deg, #6366f1, #06b6d4)',
    text:  'text-indigo-600',
    label: 'Strong Match',
  };
  if (score >= 60) return {
    bar:   'linear-gradient(90deg, #3b82f6, #6366f1)',
    text:  'text-blue-600',
    label: 'Good Match',
  };
  if (score >= 40) return {
    bar:   'linear-gradient(90deg, #f59e0b, #f97316)',
    text:  'text-amber-600',
    label: 'Partial Match',
  };
  return {
    bar:   'linear-gradient(90deg, #ef4444, #f87171)',
    text:  'text-red-500',
    label: 'Low Match',
  };
}
