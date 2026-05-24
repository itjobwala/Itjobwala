import Link from 'next/link';
import Card from '@/src/components/ui/Card';

const ACTIONS = [
  {
    href: '/recruiter/post-job',
    label: 'Post New Job',
    desc: 'Create a new job listing',
    bg: 'bg-blue-50 hover:bg-blue-100',
    icon: 'text-primary',
    iconEl: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
        <rect x="2" y="7" width="20" height="14" rx="2" />
        <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
        <line x1="12" y1="11" x2="12" y2="17" />
        <line x1="9"  y1="14" x2="15" y2="14" />
      </svg>
    ),
  },
  {
    href: '/recruiter/applicants',
    label: 'Search Candidates',
    desc: 'Browse matching profiles',
    bg: 'bg-purple-50 hover:bg-purple-100',
    icon: 'text-purple-600',
    iconEl: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.35-4.35" />
      </svg>
    ),
  },
  {
    href: '/recruiter/applicants',
    label: 'View Applicants',
    desc: 'Review all applications',
    bg: 'bg-amber-50 hover:bg-amber-100',
    icon: 'text-amber-600',
    iconEl: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    href: '/recruiter/company-profile',
    label: 'Company Profile',
    desc: 'Update your company info',
    bg: 'bg-green-50 hover:bg-green-100',
    icon: 'text-green-600',
    iconEl: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <path d="M8 21h8M12 17v4" />
      </svg>
    ),
  },
];

export default function QuickActions() {
  return (
    <Card className="shadow-sm" overflow>
      <h2 className="text-[15px] font-extrabold text-[#0f172a] mb-4" style={{ letterSpacing: '-0.3px' }}>
        Quick Actions
      </h2>
      <div className="grid grid-cols-2 gap-2.5">
        {ACTIONS.map(a => (
          <Link
            key={a.label}
            href={a.href}
            className={`flex flex-col gap-2 p-3.5 rounded-xl transition-all duration-150 hover:-translate-y-0.5 ${a.bg}`}
          >
            <span className={`${a.icon}`}>{a.iconEl}</span>
            <div>
              <p className="text-[13px] font-bold text-[#0f172a] leading-tight">{a.label}</p>
              <p className="text-[11px] text-gray-500 mt-0.5">{a.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </Card>
  );
}
