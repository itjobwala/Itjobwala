/**
 * RecruiterNavbar
 *
 * AUTHENTICATION:
 * ✅ useRecruiterAuth() Hook
 *    - Checks recruiter_token in localStorage
 *    - logout() function clears token and redirects to /recruiter/login
 *
 * NAVIGATION LINKS:
 * - Dashboard: /recruiter/dashboard (future implementation)
 * - Post a Job: /recruiter/post-job (future implementation)
 * - Posted Jobs: /recruiter/posted-jobs (calls GET /recruiter/jobs)
 * - Applicants: /recruiter/applicants (calls GET /recruiter/applicants)
 * - Company Profile: /recruiter/company-profile (calls GET/PUT /recruiter/company)
 *
 * ACTIVE LINK HIGHLIGHTING:
 * - Current pathname compared with href
 * - Active link shows blue background and primary color
 */

'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useRecruiterAuth } from '@/src/hooks/useRecruiterAuth';

export default function RecruiterNavbar() {
  const pathname = usePathname();
  const { logout } = useRecruiterAuth();

  const navItems = [
    { label: 'Dashboard', href: '/recruiter/dashboard' },
    { label: 'Post a Job', href: '/recruiter/post-job' },
    { label: 'Posted Jobs', href: '/recruiter/posted-jobs' },
    { label: 'Applicants', href: '/recruiter/applicants' },
    { label: 'Company Profile', href: '/recruiter/company-profile' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-[100] bg-white border-b border-gray-100">
      <div className="max-w-[1440px] mx-auto px-5 sm:px-8 h-[68px] flex items-center justify-between gap-6">
        {/* Logo */}
        <Link href="/recruiter/dashboard" className="flex items-center gap-1 shrink-0 hover:opacity-80 transition-opacity">
          <Image src="/logo.png" alt="itJobwala" width={30} height={30} />
          <span className="font-extrabold text-xl text-[#0f172a]" style={{ letterSpacing: '-0.5px' }}>
            it<span className="text-primary">Jobwala</span>
          </span>
        </Link>

        {/* Nav items */}
        <div className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`px-4 py-2 rounded-lg font-medium text-[13px] transition-colors ${
                pathname === item.href
                  ? 'bg-primary/10 text-primary'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>

        {/* User menu */}
        <div className="ml-auto flex items-center gap-3">
          <button
            onClick={logout}
            className="px-4 py-2 text-[13px] font-semibold text-gray-600 hover:text-gray-900 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
