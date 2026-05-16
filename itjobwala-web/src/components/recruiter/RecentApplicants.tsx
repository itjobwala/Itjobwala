'use client';

import Link from 'next/link';
import ApplicantsTable, { type Applicant } from './ApplicantsTable';
import { useRecruiterApplicantsQuery } from '@/src/hooks/useRecruiter';

const GRADIENT_COLORS = [
  'from-blue-500 to-blue-400',
  'from-purple-500 to-purple-400',
  'from-amber-500 to-amber-400',
  'from-green-500 to-green-400',
  'from-rose-400 to-rose-500',
  'from-teal-500 to-teal-400',
];
function hashGradient(str: string): string {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) & 0xff;
  return GRADIENT_COLORS[h % GRADIENT_COLORS.length];
}

function relativeDate(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
  if (diff === 0) {
    const hrs = Math.floor((Date.now() - new Date(iso).getTime()) / 3_600_000);
    return hrs < 1 ? 'Just now' : `${hrs}h ago`;
  }
  if (diff === 1) return 'Yesterday';
  if (diff < 7)  return `${diff} days ago`;
  return `${Math.floor(diff / 7)} weeks ago`;
}

export default function RecentApplicants() {
  const { data, isLoading } = useRecruiterApplicantsQuery({ limit: 8 }, true);
  const apiApplicants = data?.applicants ?? [];

  const applicants: Applicant[] = apiApplicants.map((a, i) => ({
    id:          i + 1,
    name:        a.candidateName,
    role:        a.jobTitle ?? '',
    experience:  '—',
    status:      a.status,
    initials:    a.candidateName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase(),
    avatarColor: hashGradient(a.candidateName),
    appliedDate: relativeDate(a.appliedDate),
  }));

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <div>
          <h2 className="text-[15px] font-extrabold text-[#0f172a]" style={{ letterSpacing: '-0.3px' }}>
            Recent Applicants
          </h2>
          <p className="text-[12px] text-gray-400 mt-0.5">Latest applications across all active jobs</p>
        </div>
        <Link href="/recruiter/applicants" className="text-[12px] font-bold text-primary hover:text-primary/80 transition-colors">
          View all →
        </Link>
      </div>

      {isLoading ? (
        <div className="px-5 py-8 text-center text-[13px] text-gray-400 animate-pulse">Loading applicants…</div>
      ) : applicants.length === 0 ? (
        <div className="px-5 py-8 text-center text-[13px] text-gray-400">No recent applicants.</div>
      ) : (
        <ApplicantsTable applicants={applicants} />
      )}
    </div>
  );
}
