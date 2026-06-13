'use client';

import type { CandidateCard } from '../types/candidateSearch.types';
import Button from '@/src/components/ui/Button';

interface Props {
  candidate: CandidateCard;
  onView: (id: string) => void;
}

function Avatar({ name, photoUrl }: { name: string; photoUrl: string | null }) {
  if (photoUrl) {
    return (
      <img
        src={photoUrl}
        alt={name}
        className="w-11 h-11 rounded-xl object-cover shrink-0 border border-token"
      />
    );
  }
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map(p => p[0] ?? '')
    .join('')
    .toUpperCase();
  return (
    <div className="w-11 h-11 rounded-xl shrink-0 flex items-center justify-center bg-primary/10 text-primary font-extrabold text-md">
      {initials}
    </div>
  );
}

// INTENTIONAL: seniority level colors are semantic status indicators — do not tokenize
const SENIORITY_COLOR: Record<string, string> = {
  junior:      'bg-green-50 text-green-700',
  mid:         'bg-blue-50 text-blue-700',
  'mid-level': 'bg-blue-50 text-blue-700',
  senior:      'bg-purple-50 text-purple-700',
  lead:        'bg-amber-50 text-amber-700',
  principal:   'bg-rose-50 text-rose-700',
};

function seniorityClass(s: string | null) {
  if (!s) return 'bg-surface-hover text-muted';
  return SENIORITY_COLOR[s.toLowerCase()] ?? 'bg-surface-hover text-muted';
}

export default function CandidateResultCard({ candidate, onView }: Props) {
  const SKILLS_SHOWN = 4;
  const visibleSkills = candidate.skills.slice(0, SKILLS_SHOWN);
  const extraSkills   = candidate.skills.length - SKILLS_SHOWN;

  return (
    <div className="bg-surface rounded-2xl border border-token shadow-sm p-4 sm:p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3">
        <Avatar name={candidate.name} photoUrl={candidate.profile_photo_url} />

        <div className="flex-1 min-w-0">
          {/* Name row */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-base font-bold text-heading truncate">{candidate.name}</span>
            {candidate.open_to_work && (
              <span className="text-[10px] font-bold rounded-full py-[2px] px-2 bg-green-50 text-green-700 shrink-0">
                Open to work
              </span>
            )}
          </div>

          {/* Title + location */}
          {candidate.title && (
            <p className="text-sm text-muted mt-0.5 truncate">{candidate.title}</p>
          )}
          <div className="flex items-center gap-3 mt-1 text-caption text-subtle flex-wrap">
            {candidate.location && (
              <span className="flex items-center gap-1">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M12 21s-8-7.3-8-12a8 8 0 1 1 16 0c0 4.7-8 12-8 12z" />
                  <circle cx="12" cy="9" r="3" />
                </svg>
                {candidate.location}
              </span>
            )}
            <span className="flex items-center gap-1">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <rect x="2" y="7" width="20" height="14" rx="2" />
                <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
              </svg>
              {candidate.experience_years === 0 ? 'Fresher' : `${candidate.experience_years} yr${candidate.experience_years !== 1 ? 's' : ''}`}
            </span>
          </div>

          {/* QA badges — intentional indigo/emerald colors */}
          {(candidate.qa_specialization || candidate.qa_seniority || candidate.qa_match_score != null) && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {candidate.qa_specialization && (
                <span className="text-micro font-semibold rounded-full py-[2px] px-2.5 bg-indigo-50 text-indigo-700">
                  {candidate.qa_specialization}
                </span>
              )}
              {candidate.qa_seniority && (
                <span className={`text-micro font-semibold rounded-full py-[2px] px-2.5 ${seniorityClass(candidate.qa_seniority)}`}>
                  {candidate.qa_seniority}
                </span>
              )}
              {candidate.qa_match_score != null && (
                <span className="text-micro font-semibold rounded-full py-[2px] px-2.5 bg-emerald-50 text-emerald-700">
                  QA {candidate.qa_match_score}
                </span>
              )}
            </div>
          )}

          {/* Skills */}
          {visibleSkills.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {visibleSkills.map(s => (
                <span key={s} className="text-micro font-semibold rounded-full py-[2px] px-2 bg-surface-hover text-body-secondary">
                  {s}
                </span>
              ))}
              {extraSkills > 0 && (
                <span className="text-micro font-semibold rounded-full py-[2px] px-2 bg-surface-alt text-subtle">
                  +{extraSkills}
                </span>
              )}
            </div>
          )}
        </div>

        {/* CTA */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onView(candidate.id)}
          className="shrink-0"
        >
          View profile
        </Button>
      </div>
    </div>
  );
}
