'use client';

import Card from '@/src/components/ui/Card';
import { useProfileCompletionQuery } from '../hooks/useProfile';

const FIELD_LABELS: Record<string, string> = {
  resume:     'Upload resume',
  experience: 'Add work experience',
  skills:     'Add skills',
  photo:      'Add profile photo',
  education:  'Add education',
  linked_in:  'Add LinkedIn profile',
};

export default function ProfileCompletionCard() {
  const { data, isLoading, isError } = useProfileCompletionQuery();

  const circumference = 2 * Math.PI * 37.5;
  const completion    = data?.percentage ?? 0;
  const dash          = (completion / 100) * circumference;

  const incompleteSteps = Object.entries(data?.breakdown ?? {})
    .filter(([, isDone]) => !isDone)
    .slice(0, 3)
    .map(([field]) => FIELD_LABELS[field] ?? field);

  if (isLoading) {
    return (
      <Card overflow>
        <h3 className="text-base font-extrabold text-heading mb-4">Profile strength</h3>
        <div className="h-20 bg-surface-hover rounded-lg animate-pulse" />
      </Card>
    );
  }

  if (isError) {
    return (
      <Card overflow>
        <h3 className="text-base font-extrabold text-heading mb-4">Profile strength</h3>
        <p className="text-caption text-muted">Unable to load profile strength.</p>
      </Card>
    );
  }

  return (
    <Card overflow className="border-token-mid">
      <h3 className="text-base font-extrabold text-heading mb-4">Profile strength</h3>

      <div className="flex items-center gap-5 mb-5">
        <div className="relative w-[88px] h-[88px] shrink-0">
          <svg width="88" height="88" viewBox="0 0 88 88" className="block">
            <circle cx="44" cy="44" r="37.5" fill="none" stroke="var(--color-surface-hover)" strokeWidth="7" />
            <circle
              cx="44" cy="44" r="37.5"
              fill="none"
              stroke="var(--color-primary)"
              strokeWidth="7"
              strokeLinecap="round"
              strokeDasharray={`${dash} ${circumference - dash}`}
              strokeDashoffset={circumference * 0.25}
              transform="rotate(-90 44 44)"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5">
            <span className="text-xl font-extrabold text-heading leading-none tracking-tight">
              {completion}<span className="text-xs font-bold">%</span>
            </span>
            <span className="text-[10px] text-subtle font-medium">complete</span>
          </div>
        </div>
        <div>
          <p className="text-sm font-semibold text-heading mb-1">
            {completion === 100 ? 'Perfect!' : completion >= 80 ? 'Almost there!' : completion >= 60 ? 'Good progress' : 'Keep going'}
          </p>
          <p className="text-caption text-muted leading-[1.6]">
            {completion === 100 ? (
              <>Your profile is complete. You&apos;re all set to get recruiter views!</>
            ) : (
              <>Complete your profile to get <span className="font-semibold text-primary">3× more</span> recruiter views.</>
            )}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {incompleteSteps.map(label => (
          <div key={label} className="flex items-center gap-2.5 p-2.5 bg-primary/5 rounded-xl">
            <span className="w-4 h-4 rounded-full bg-surface-mid flex items-center justify-center shrink-0">
              <svg width="7" height="7" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-subtle">
                <path d="M6 3v6M3 6h6" />
              </svg>
            </span>
            <span className="text-caption font-medium text-body-secondary">{label}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
