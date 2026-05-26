'use client';

import Link from 'next/link';
import Card from '@/src/components/ui/Card';
import { useAuthHydration } from '@/src/hooks/useAuthHydration';
import { useProfileCompletionQuery } from '@/features/candidate/profile/hooks/useProfile';

const FIELD_LABELS: Record<string, string> = {
  resume:     'Upload your resume',
  experience: 'Add work experience',
  skills:     'Add skills',
  photo:      'Add profile photo',
  education:  'Add education details',
  linked_in:  'Add LinkedIn profile',
};

export default function ProfileCompletionCard() {
  const { isHydrated, session, isLoading: authLoading } = useAuthHydration();
  const isCandidate = isHydrated && !authLoading && session?.userRole === 'candidate';

  const { data, isLoading } = useProfileCompletionQuery(isCandidate);

  if (!isHydrated || authLoading) {
    return <Card overflow><div className="h-20 bg-gray-100 rounded-lg animate-pulse" /></Card>;
  }

  if (!session || session.userRole !== 'candidate') return null;

  if (isLoading) {
    return <Card overflow><div className="h-20 bg-gray-100 rounded-lg animate-pulse" /></Card>;
  }

  const completion = data?.percentage ?? 0;
  const checklist = Object.entries(data?.breakdown ?? {})
    .map(([field, done]) => ({ label: FIELD_LABELS[field] ?? field, done: done as boolean }));

  return (
    <Card overflow>
      <div className="flex items-start justify-between mb-1">
        <h3 className="text-[14px] font-extrabold text-[#0f172a]">Profile strength</h3>
        <span className="text-[13px] font-bold text-primary">{completion}%</span>
      </div>
      <p className="text-[12px] text-gray-400 mb-3">Complete your profile to get more responses from recruiters.</p>

      <div className="h-2 bg-gray-100 rounded-full mb-5 overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all duration-700"
          style={{ width: `${completion}%` }}
        />
      </div>

      <div className="flex flex-col gap-2 mb-5">
        {checklist.map(item => (
          <div key={item.label} className="flex items-center gap-2.5">
            <span className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${item.done ? 'bg-green-500' : 'bg-gray-200'}`}>
              {item.done ? (
                <svg width="9" height="9" viewBox="0 0 12 12" fill="none" stroke="white" strokeWidth="2.5"><path d="M2 6l3 3 5-5" /></svg>
              ) : (
                <svg width="7" height="7" viewBox="0 0 12 12" fill="none" stroke="#9ca3af" strokeWidth="2.5"><path d="M6 3v6M3 6h6" /></svg>
              )}
            </span>
            <span className={`text-[12px] ${item.done ? 'text-gray-400 line-through' : 'text-gray-700 font-medium'}`}>
              {item.label}
            </span>
          </div>
        ))}
      </div>

      <Link
        href="/candidate/profile"
        className="block text-center text-[13px] font-bold text-primary border border-primary/30 rounded-xl py-2.5 hover:bg-primary/5 transition-colors"
      >
        Complete profile →
      </Link>
    </Card>
  );
}
