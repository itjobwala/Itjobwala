import Link from 'next/link';

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
    href: '/recruiter/interviews',
    label: 'Schedule Interview',
    desc: 'Set up a candidate interview',
    bg: 'bg-amber-50 hover:bg-amber-100',
    icon: 'text-amber-600',
    iconEl: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <path d="M16 2v4M8 2v4M3 10h18" />
        <line x1="12" y1="14" x2="12" y2="18" />
        <line x1="10" y1="16" x2="14" y2="16" />
      </svg>
    ),
  },
  {
    href: '/recruiter/billing',
    label: 'Upgrade Plan',
    desc: 'Unlock more job postings',
    bg: 'bg-green-50 hover:bg-green-100',
    icon: 'text-green-600',
    iconEl: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
        <polyline points="17 6 23 6 23 12" />
      </svg>
    ),
  },
];

export default function QuickActions() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
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
    </div>
  );
}
