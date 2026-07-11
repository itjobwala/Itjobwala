import Link from 'next/link';
import { PRIMARY } from '@/src/lib/constants';

export default function PostJobSuccessScreen({ jobId }: { jobId: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-5 sm:p-6"
      style={{ fontFamily: 'var(--font-plus-jakarta)', background: '#f8faff' }}>
      <div className="text-center rounded-3xl w-full px-6 py-10 sm:px-12 sm:py-14"
        style={{ background: '#fff', maxWidth: 460, boxShadow: `0 24px 64px ${PRIMARY}12` }}>
        <div className="flex items-center justify-center rounded-full mx-auto mb-6"
          style={{ width: 80, height: 80, background: '#f0fdf4', border: '2px solid #bbf7d0' }}>
          <svg width="36" height="36" fill="none" stroke="#22c55e" strokeWidth="2.5" viewBox="0 0 24 24">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h2 className="font-extrabold text-heading mb-2" style={{ fontSize: 26, letterSpacing: -0.8 }}>
          Account created &amp; job posted!
        </h2>
        <p className="text-sm text-muted mb-2 leading-relaxed">
          Your recruiter account at <strong style={{ color: PRIMARY }}>itJobwala</strong> is ready and your job is live as a draft.
        </p>
        <p className="text-sm text-subtle mb-8">
          Review and publish your job from the dashboard to start receiving applications.
        </p>
        <Link href={`/recruiter/posted-jobs/${jobId}`}
          className="block text-white rounded-full font-bold text-sm text-center mb-3 py-3.5 transition-all"
          style={{ background: PRIMARY, textDecoration: 'none' }}
          onMouseEnter={e => { e.currentTarget.style.background = '#0d3fd4'; }}
          onMouseLeave={e => { e.currentTarget.style.background = PRIMARY; }}>
          View &amp; publish your job →
        </Link>
        <Link href="/recruiter/dashboard"
          className="block text-sm font-semibold"
          style={{ color: PRIMARY, textDecoration: 'none' }}>
          Go to dashboard
        </Link>
      </div>
    </div>
  );
}
