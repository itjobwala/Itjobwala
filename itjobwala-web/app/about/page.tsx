import { SmartNavbar } from '@/layout/navbar';
import { Footer } from '@/features/home';

export const metadata = {
  title: 'About Us — itJobwala',
  description: 'Learn about itJobwala — India\'s focused IT job platform connecting candidates and recruiters without the noise.',
};

const VALUES = [
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    title: 'Candidate-first',
    body: 'Every feature is designed around helping candidates get noticed, not lost in a pile of résumés.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
    title: 'No middlemen',
    body: 'Candidates and recruiters talk directly. No third-party consultants skimming value from both sides.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),
    title: 'Quality over volume',
    body: 'We surface relevant matches, not every job ever posted. Signal beats noise every time.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    ),
    title: 'Transparent by default',
    body: 'Salaries are shown upfront. Application status is visible. No black holes.',
  },
];

const STATS = [
  { value: '4,000 +', label: 'Active IT jobs' },
  { value: '500 +',   label: 'Companies hiring' },
  { value: '12,000 +', label: 'Registered candidates' },
  { value: '92 %',    label: 'Recruiter reply rate' },
];

const TEAM = [
  { initials: 'NG', name: 'Neelam Gali', role: 'Founder & CEO', color: 'from-blue-500 to-indigo-600' },
  { initials: 'RK', name: 'Rahul Kumar', role: 'Head of Engineering', color: 'from-violet-500 to-purple-600' },
  { initials: 'PS', name: 'Priya Sharma', role: 'Head of Product', color: 'from-emerald-500 to-teal-600' },
];

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-surface">
      <SmartNavbar />

      {/* Hero */}
      <section className="pt-16 lg:pt-[72px]">
        <div className="max-w-[1200px] mx-auto px-5 sm:px-8 py-20 text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 text-primary text-xs font-bold px-4 py-1.5 mb-6 uppercase tracking-widest">
            Our story
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-heading mb-6" style={{ letterSpacing: '-1.5px', lineHeight: 1.1 }}>
            IT hiring in India, finally<br className="hidden sm:block" /> without the noise
          </h1>
          <p className="text-lg text-muted max-w-2xl mx-auto leading-relaxed">
            itJobwala was built out of frustration with bloated job boards, ghosting recruiters, and consultancies charging both sides.
            We set out to fix that with a platform built purely for IT professionals in India.
          </p>
        </div>
      </section>

      {/* Stats strip */}
      <section className="border-y border-token bg-surface-alt">
        <div className="max-w-[1200px] mx-auto px-5 sm:px-8 py-12 grid grid-cols-2 sm:grid-cols-4 gap-8">
          {STATS.map(s => (
            <div key={s.label} className="text-center">
              <div className="text-3xl sm:text-4xl font-extrabold text-heading mb-1" style={{ letterSpacing: '-1px' }}>{s.value}</div>
              <div className="text-sm text-muted">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Mission */}
      <section className="max-w-[1200px] mx-auto px-5 sm:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-primary mb-4 block">Mission</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-heading mb-6" style={{ letterSpacing: '-1px', lineHeight: 1.15 }}>
              Direct access between<br />talent and opportunity
            </h2>
            <p className="text-base text-muted leading-relaxed mb-5">
              The Indian IT job market has a middleman problem. Thousands of consultants sit between candidates and companies, adding delay, opacity, and cost to every hire.
            </p>
            <p className="text-base text-muted leading-relaxed">
              itJobwala removes those layers. Candidates apply directly. Recruiters respond directly. Salaries are published upfront. Everyone saves time — and hiring gets done faster.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {VALUES.map(v => (
              <div key={v.title} className="bg-surface-alt border border-token rounded-2xl p-5">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-3">
                  {v.icon}
                </div>
                <h3 className="text-sm font-bold text-heading mb-1">{v.title}</h3>
                <p className="text-xs text-muted leading-relaxed">{v.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="bg-surface-alt border-y border-token">
        <div className="max-w-[1200px] mx-auto px-5 sm:px-8 py-20">
          <div className="text-center mb-14">
            <span className="text-xs font-bold uppercase tracking-widest text-primary mb-4 block">The team</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-heading" style={{ letterSpacing: '-1px' }}>
              Built by people who felt the pain
            </h2>
          </div>
          <div className="flex flex-wrap justify-center gap-6">
            {TEAM.map(m => (
              <div key={m.name} className="bg-surface border border-token rounded-2xl p-6 text-center w-[200px]">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${m.color} flex items-center justify-center text-white font-extrabold text-xl mx-auto mb-4`}>
                  {m.initials}
                </div>
                <div className="font-bold text-heading text-sm">{m.name}</div>
                <div className="text-xs text-muted mt-1">{m.role}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-[1200px] mx-auto px-5 sm:px-8 py-20 text-center">
        <h2 className="text-3xl font-extrabold text-heading mb-4" style={{ letterSpacing: '-0.5px' }}>
          Ready to find your next IT role?
        </h2>
        <p className="text-muted mb-8">Join 12,000+ IT professionals already on itJobwala.</p>
        <div className="flex flex-wrap gap-3 justify-center">
          <a
            href="/auth/signup"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-white bg-primary hover:bg-primary/90 transition-colors"
          >
            Get started free →
          </a>
          <a
            href="/contact"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-primary border border-primary/30 hover:bg-primary/5 transition-colors"
          >
            Contact us
          </a>
        </div>
      </section>

      <Footer />
    </main>
  );
}
