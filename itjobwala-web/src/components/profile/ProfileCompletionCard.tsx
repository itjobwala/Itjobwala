'use client';

import { useEffect, useState } from 'react';
import { getProfileCompletion } from '@/src/lib/api/profile';
import type { ProfileCompletionData } from '@/src/types/profile';

interface ProfileStep {
  label: string;
  done: boolean;
}

const FIELD_LABELS: Record<string, string> = {
  resume: 'Upload resume',
  experience: 'Add work experience',
  skills: 'Add skills',
  photo: 'Add profile photo',
  education: 'Add education',
  linked_in: 'Add LinkedIn profile',
};

export default function ProfileCompletionCard() {
  const [completion, setCompletion] = useState(0);
  const [steps, setSteps] = useState<ProfileStep[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCompletion = async () => {
      try {
        setLoading(true);
        const data = await getProfileCompletion();
        setCompletion(data.percentage);

        const incompleteFields = Object.entries(data.breakdown)
          .filter(([_, isDone]) => !isDone)
          .map(([field]) => ({
            label: FIELD_LABELS[field] || field,
            done: false,
          }));

        setSteps(incompleteFields);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load profile completion');
        setSteps([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCompletion();
  }, []);

  const circumference = 2 * Math.PI * 40;
  const dash = (completion / 100) * circumference;
  const incompleteSteps = steps.slice(0, 3);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <h3 className="text-[14px] font-extrabold text-[#0f172a] mb-4">Profile strength</h3>
        <div className="h-20 bg-gray-100 rounded-lg animate-pulse" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <h3 className="text-[14px] font-extrabold text-[#0f172a] mb-4">Profile strength</h3>
        <p className="text-[12px] text-gray-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5">
      <h3 className="text-[14px] font-extrabold text-[#0f172a] mb-4">Profile strength</h3>

      {/* Circular progress */}
      <div className="flex items-center gap-5 mb-5">
        <div className="relative shrink-0">
          <svg width="88" height="88" viewBox="0 0 96 96">
            <circle cx="48" cy="48" r="40" fill="none" stroke="#f3f4f6" strokeWidth="7" />
            <circle
              cx="48" cy="48" r="40"
              fill="none"
              stroke="#1557FF"
              strokeWidth="7"
              strokeLinecap="round"
              strokeDasharray={`${dash} ${circumference - dash}`}
              strokeDashoffset={circumference * 0.25}
              transform="rotate(-90 48 48)"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-[20px] font-extrabold text-[#0f172a] leading-none">{completion}%</span>
            <span className="text-[10px] text-gray-400 font-medium">complete</span>
          </div>
        </div>
        <div>
          <p className="text-[13px] font-semibold text-[#0f172a] mb-1">
            {completion === 100
              ? 'Perfect!'
              : completion >= 80
              ? 'Almost there!'
              : completion >= 60
              ? 'Good progress'
              : 'Keep going'}
          </p>
          <p className="text-[12px] text-gray-500 leading-[1.6]">
            {completion === 100 ? (
              <>Your profile is complete. You're all set to get recruiter views!</>
            ) : (
              <>
                Complete your profile to get{' '}
                <span className="font-semibold text-primary">3× more</span> recruiter views.
              </>
            )}
          </p>
        </div>
      </div>

      {/* Checklist */}
      <div className="flex flex-col gap-2">
        {incompleteSteps.map(step => (
          <div key={step.label} className="flex items-center gap-2.5 p-2.5 bg-primary/5 rounded-xl">
            <span className="w-4 h-4 rounded-full bg-gray-200 flex items-center justify-center shrink-0">
              <svg width="7" height="7" viewBox="0 0 12 12" fill="none" stroke="#9ca3af" strokeWidth="2.5">
                <path d="M6 3v6M3 6h6" />
              </svg>
            </span>
            <span className="text-[12px] font-medium text-gray-600">{step.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
