'use client';

import Link from 'next/link';
import ApplicantsTable, { type Applicant } from './ApplicantsTable';
import { useRecruiterApplicantsQuery } from '@/features/recruiter/hooks';
import Card from '@/src/components/ui/Card';
import { relativeTime } from '@/src/lib/utils/format';

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

export default function RecentApplicants() {
  const { data, isLoading } = useRecruiterApplicantsQuery({ limit: 8 }, true);
  const apiApplicants = data?.applicants ?? [];

  const applicants: Applicant[] = apiApplicants.map((a) => ({
    id:          a.id,
    name:        a.candidateName,
    role:        a.jobTitle ?? '',
    experience:  a.experience != null && a.experience > 0 ? `${a.experience} yr${a.experience !== 1 ? 's' : ''}` : '—',
    status:      a.status,
    initials:    a.candidateName.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase(),
    avatarColor: hashGradient(a.candidateName),
    appliedDate: relativeTime(a.appliedDate),
  }));

  return (
    <Card padding="none" className="shadow-sm h-[350px] flex flex-col overflow-hidden">
      <div className="px-5 py-4 border-b border-token flex items-center justify-between">
        <div>
          <h2 className="text-h6 text-heading" style={{ letterSpacing: '-0.3px' }}>
            Recent Applicants
          </h2>
          <p className="text-caption text-subtle mt-0.5">Latest applications across all active jobs</p>
        </div>
        {applicants.length > 0 && (
          <Link href="/recruiter/applicants" className="text-[12px] font-bold text-primary hover:text-primary/80 transition-colors">
            View all →
          </Link>
        )}
      </div>

      {isLoading ? (
        <div className="px-5 py-8 text-center text-sm text-subtle animate-pulse">Loading applicants…</div>
      ) : applicants.length === 0 ? (
        <div className="px-5 py-8 text-center text-sm text-subtle">No recent applicants.</div>
      ) : (
        <ApplicantsTable applicants={applicants.slice(0, 3)} />
      )}
    </Card>
  );
}
