'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const PRIMARY = '#1557FF';

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  badge?: number;
}

interface NavSection {
  sectionLabel?: string;
  items: NavItem[];
}

const NAV_SECTIONS: NavSection[] = [
  {
    items: [
      {
        href: '/recruiter/dashboard',
        label: 'Dashboard',
        icon: (
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <rect x="3"  y="3"  width="7" height="7" rx="1.5" />
            <rect x="14" y="3"  width="7" height="7" rx="1.5" />
            <rect x="3"  y="14" width="7" height="7" rx="1.5" />
            <rect x="14" y="14" width="7" height="7" rx="1.5" />
          </svg>
        ),
      },
      {
        href: '/recruiter/jobs',
        label: 'Posted Jobs',
        icon: (
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <rect x="2" y="7" width="20" height="14" rx="2" />
            <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
          </svg>
        ),
      },
      {
        href: '/recruiter/applicants',
        label: 'Applicants',
        badge: 12,
        icon: (
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        ),
      },
      {
        href: '/recruiter/interviews',
        label: 'Interviews',
        icon: (
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <path d="M16 2v4M8 2v4M3 10h18" />
          </svg>
        ),
      },
      {
        href: '/recruiter/messages',
        label: 'Messages',
        badge: 3,
        icon: (
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        ),
      },
    ],
  },
  {
    sectionLabel: 'MANAGE',
    items: [
      {
        href: '/recruiter/company',
        label: 'Company Profile',
        icon: (
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
        ),
      },
      {
        href: '/recruiter/billing',
        label: 'Subscription',
        icon: (
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <rect x="1" y="4" width="22" height="16" rx="2" />
            <path d="M1 10h22" />
          </svg>
        ),
      },
      {
        href: '/recruiter/settings',
        label: 'Settings',
        icon: (
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        ),
      },
    ],
  },
];

interface RecruiterSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function RecruiterSidebar({ isOpen, onClose }: RecruiterSidebarProps) {
  const pathname = usePathname();

  function handleLinkClick() {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) onClose();
  }

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-[150] lg:hidden backdrop-blur-[2px]"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-[68px] left-0 bottom-0 w-[240px] bg-white border-r border-gray-100 z-[160] overflow-y-auto flex flex-col transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Company info */}
        <div className="px-4 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-extrabold text-[12px] shrink-0"
              style={{ background: `linear-gradient(135deg, ${PRIMARY} 0%, #4338ca 100%)` }}
            >
              TN
            </div>
            <div className="min-w-0">
              <p className="text-[13px] font-bold text-[#0f172a] truncate leading-tight">TechNova Solutions</p>
              <p className="text-[11px] text-gray-400 mt-0.5 truncate">Priya Sharma</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-3 space-y-4 overflow-y-auto">
          {NAV_SECTIONS.map((section, si) => (
            <div key={si}>
              {section.sectionLabel && (
                <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-[1.4px] px-3 mb-1.5">
                  {section.sectionLabel}
                </p>
              )}
              <ul className="space-y-0.5">
                {section.items.map(item => {
                  const active =
                    pathname === item.href ||
                    (item.href !== '/recruiter/dashboard' && pathname.startsWith(item.href + '/'));
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={handleLinkClick}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-semibold transition-all duration-150 group ${
                          active
                            ? 'bg-primary/10 text-primary'
                            : 'text-[#374151] hover:bg-gray-50 hover:text-[#0f172a]'
                        }`}
                      >
                        <span
                          className={`transition-colors shrink-0 ${
                            active ? 'text-primary' : 'text-gray-400 group-hover:text-gray-500'
                          }`}
                        >
                          {item.icon}
                        </span>
                        <span className="flex-1">{item.label}</span>
                        {item.badge != null && (
                          <span
                            className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-full min-w-[20px] text-center ${
                              active ? 'bg-primary text-white' : 'bg-gray-100 text-gray-500'
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* Bottom: plan */}
        <div className="px-3 pb-4 pt-3 border-t border-gray-100 space-y-2">
          <div className="bg-primary/5 border border-primary/10 rounded-2xl px-3.5 py-3">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-extrabold text-primary">Pro Plan</span>
              <span className="text-[10px] text-gray-400">3 / 10 jobs</span>
            </div>
            <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full" style={{ width: '30%' }} />
            </div>
            <Link
              href="/recruiter/billing"
              className="block mt-2.5 text-center text-[11px] font-bold text-primary hover:text-primary/80 transition-colors"
            >
              Upgrade Plan →
            </Link>
          </div>

        </div>
      </aside>
    </>
  );
}
