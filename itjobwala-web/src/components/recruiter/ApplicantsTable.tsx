'use client';

import Link from 'next/link';

const STATUS_STYLES: Record<string, string> = {
  shortlisted: 'bg-blue-50 text-blue-700',
  interview:   'bg-amber-50 text-amber-700',
  pending:     'bg-gray-100 text-gray-600',
  rejected:    'bg-red-50 text-red-500',
  selected:    'bg-green-50 text-green-700',
};

const STATUS_LABELS: Record<string, string> = {
  shortlisted: 'Shortlisted',
  interview:   'Interview',
  pending:     'Under Review',
  rejected:    'Rejected',
  selected:    'Selected',
};

export interface Applicant {
  id: number;
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
          <tr className="bg-gray-50/60">
            <th className="text-left text-[11px] font-bold text-gray-400 uppercase tracking-wide px-5 py-3">
              Candidate
            </th>
            <th className="text-left text-[11px] font-bold text-gray-400 uppercase tracking-wide px-4 py-3 hidden sm:table-cell">
              Role Applied
            </th>
            <th className="text-left text-[11px] font-bold text-gray-400 uppercase tracking-wide px-4 py-3 hidden md:table-cell">
              Experience
            </th>
            <th className="text-left text-[11px] font-bold text-gray-400 uppercase tracking-wide px-4 py-3 hidden lg:table-cell">
              Applied
            </th>
            <th className="text-left text-[11px] font-bold text-gray-400 uppercase tracking-wide px-4 py-3">
              Status
            </th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {applicants.map(a => (
            <tr key={a.id} className="hover:bg-gray-50/60 transition-colors group">
              <td className="px-5 py-3.5">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-xl bg-gradient-to-br ${a.avatarColor} flex items-center justify-center text-white font-bold text-[11px] shrink-0`}
                  >
                    {a.initials}
                  </div>
                  <span className="text-[13px] font-semibold text-[#0f172a] group-hover:text-primary transition-colors">
                    {a.name}
                  </span>
                </div>
              </td>
              <td className="px-4 py-3.5 hidden sm:table-cell">
                <span className="text-[13px] text-gray-600">{a.role}</span>
              </td>
              <td className="px-4 py-3.5 hidden md:table-cell">
                <span className="text-[13px] text-gray-500">{a.experience}</span>
              </td>
              <td className="px-4 py-3.5 hidden lg:table-cell">
                <span className="text-[12px] text-gray-400">{a.appliedDate}</span>
              </td>
              <td className="px-4 py-3.5">
                <span
                  className={`text-[11px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap ${STATUS_STYLES[a.status]}`}
                >
                  {STATUS_LABELS[a.status]}
                </span>
              </td>
              <td className="px-4 py-3.5 text-right">
                <Link
                  href={`/recruiter/applicants/${a.id}`}
                  className="text-[12px] font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity hover:underline"
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
