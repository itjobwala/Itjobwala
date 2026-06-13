import Link from 'next/link';
import Image from 'next/image';
import { PRIMARY } from '@/src/lib/constants';

export default function PostJobNavbar() {
  return (
    <nav className="sticky top-0 z-[200] border-b border-black/[0.06] shrink-0"
      style={{ background: 'rgba(255,255,255,0.96)', backdropFilter: 'blur(14px)' }}>
      <div className="max-w-[1440px] mx-auto px-5 lg:px-10 flex items-center justify-between h-[68px]">
        <Link href="/" className="flex items-center gap-1 hover:opacity-80 transition-opacity">
          <Image src="/logo.png" alt="itJobwala" width={30} height={30} />
          <span className="font-extrabold text-xl text-heading" style={{ letterSpacing: '-0.5px' }}>
            it<span style={{ color: PRIMARY }}>Jobwala</span>
          </span>
        </Link>
        <div className="flex items-center gap-3 sm:gap-5">
          <span className="hidden sm:inline text-sm text-muted">Already a recruiter?</span>
          <Link href="/auth/login?role=recruiter"
            className="text-sm font-bold rounded-lg px-4 sm:px-[18px] py-2 transition-all duration-200"
            style={{ color: PRIMARY, border: `1.5px solid ${PRIMARY}`, textDecoration: 'none' }}
            onMouseEnter={e => { e.currentTarget.style.background = PRIMARY; e.currentTarget.style.color = '#fff'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = PRIMARY; }}>
            Log in
          </Link>
        </div>
      </div>
    </nav>
  );
}
