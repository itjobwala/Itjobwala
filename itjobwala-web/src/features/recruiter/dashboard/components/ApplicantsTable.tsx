'use client';

import Link from 'next/link';
import StatusBadge from '@/src/components/ui/StatusBadge';

export interface Applicant {
  id: string;
  name: string;
  role: string;
  experience: string;
  status: string;
  initials: string;
  avatarColor: string;
  appliedDate: string;
}

interface Props {
  applicants: Applicant[];
}

export default function ApplicantsTable({ applicants }: Props) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="bg-surface-alt/60">
            <th className="text-left text-caption font-semibold text-subtle px-5 py-3">
              Candidate
            </th>
            <th className="text-left text-caption font-semibold text-subtle px-4 py-3 hidden sm:table-cell min-w-[220px]">
              Role Applied
            </th>
            <th className="text-left text-caption font-semibold text-subtle px-4 py-3 hidden md:table-cell">
              Experience
            </th>
            <th className="text-left text-caption font-semibold text-subtle px-4 py-3 hidden lg:table-cell">
              Applied
            </th>
            <th className="text-left text-caption font-semibold text-subtle px-4 py-3">
              Status
            </th>
            <th className="text-right text-caption font-semibold text-subtle px-4 py-3">
              Action
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {applicants.map(a => (
            <tr key={a.id} className="hover:bg-surface-alt/60 transition-colors group">
              <td className="px-5 py-3.5 max-w-[160px]">
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-8 h-8 rounded-xl bg-gradient-to-br ${a.avatarColor} flex items-center justify-center text-white font-bold text-micro shrink-0`}
                  >
                    {a.initials}
                  </div>
                  <span
                    title={a.name}
                    className="flex-1 min-w-0 text-sm font-semibold text-heading group-hover:text-primary transition-colors truncate"
                  >
                    {a.name}
                  </span>
                </div>
              </td>
              <td className="px-4 py-3.5 hidden sm:table-cell min-w-[220px]">
                <span className="text-sm text-body-secondary">{a.role}</span>
              </td>
              <td className="px-4 py-3.5 hidden md:table-cell">
                <span className="text-sm text-muted">{a.experience}</span>
              </td>
              <td className="px-4 py-3.5 hidden lg:table-cell">
                <span className="text-caption text-subtle">{a.appliedDate}</span>
              </td>
              <td className="px-4 py-3.5">
                <StatusBadge status={a.status} />
              </td>
              <td className="px-4 py-3.5 text-right">
                <Link
                  href={`/recruiter/applicants/${a.id}`}
                  className="text-caption font-bold text-primary hover:underline whitespace-nowrap"
                >
                  View →
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
