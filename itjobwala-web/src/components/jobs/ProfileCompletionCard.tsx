'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import Card from '@/src/components/ui/Card';
import { useAuthHydration } from '@/src/hooks/useAuthHydration';
import { getProfileCompletion } from '@/src/lib/api/profile';

interface ChecklistItem {
  label: string;
  done: boolean;
}

const FIELD_LABELS: Record<string, string> = {
  resume: 'Upload your resume',
  experience: 'Add work experience',
  skills: 'Add skills',
  photo: 'Add profile photo',
  education: 'Add education details',
  linked_in: 'Add LinkedIn profile',
};

export default function ProfileCompletionCard() {
  const { isHydrated, session, isLoading } = useAuthHydration();
  const [completion, setCompletion] = useState(0);
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    if (!isHydrated || isLoading) return;
    if (!session || session.userRole !== 'candidate') return;

    const fetchCompletion = async () => {
      try {
        const data = await getProfileCompletion();
        setCompletion(data.percentage);

        const incompleteItems = Object.entries(data.breakdown)
          .filter(([, isDone]) => !isDone)
          .map(([field]) => ({
            label: FIELD_LABELS[field] || field,
            done: false,
          }));

        setChecklist(incompleteItems);
      } catch (err) {
        if (typeof err === 'object' && err !== null && 'status' in err && err.status === 401) {
          setHidden(true);
          return;
        }

        console.error('Failed to load profile completion:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCompletion();
  }, [isHydrated, isLoading, session]);

  if (!isHydrated || isLoading) {
    return (
      <Card overflow>
        <div className="h-20 bg-gray-100 rounded-lg animate-pulse" />
      </Card>
    );
  }

  if (!session || session.userRole !== 'candidate') return null;
  if (hidden) return null;

  if (loading) {
    return (
      <Card overflow>
        <div className="h-20 bg-gray-100 rounded-lg animate-pulse" />
      </Card>
    );
  }

  return (
    <Card overflow>
      <div className="flex items-start justify-between mb-1">
        <h3 className="text-[14px] font-extrabold text-[#0f172a]">Profile strength</h3>
        <span className="text-[13px] font-bold text-primary">{completion}%</span>
      </div>
      <p className="text-[12px] text-gray-400 mb-3">Complete your profile to get more responses from recruiters.</p>

      {/* Progress bar */}
      <div className="h-2 bg-gray-100 rounded-full mb-5 overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all duration-700"
          style={{ width: `${completion}%` }}
        />
      </div>

      {/* Checklist */}
      <div className="flex flex-col gap-2 mb-5">
        {checklist.map(item => (
          <div key={item.label} className="flex items-center gap-2.5">
            <span className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${item.done ? 'bg-green-500' : 'bg-gray-200'}`}>
              {item.done ? (
                <svg width="9" height="9" viewBox="0 0 12 12" fill="none" stroke="white" strokeWidth="2.5">
                  <path d="M2 6l3 3 5-5" />
                </svg>
              ) : (
                <svg width="7" height="7" viewBox="0 0 12 12" fill="none" stroke="#9ca3af" strokeWidth="2.5">
                  <path d="M6 3v6M3 6h6" />
                </svg>
              )}
            </span>
            <span className={`text-[12px] ${item.done ? 'text-gray-400 line-through' : 'text-gray-700 font-medium'}`}>
              {item.label}
            </span>
          </div>
        ))}
      </div>

      <Link
        href="/profile"
        className="block text-center text-[13px] font-bold text-primary border border-primary/30 rounded-xl py-2.5 hover:bg-primary/5 transition-colors"
      >
        Complete profile →
      </Link>
    </Card>
  );
}
