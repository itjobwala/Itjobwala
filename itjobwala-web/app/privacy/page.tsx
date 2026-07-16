import { SmartNavbar } from '@/layout/navbar';
import { Footer } from '@/features/home';

export const metadata = {
  title: 'Privacy Policy — itJobwala',
  description: 'How itJobwala collects, uses, and protects your personal information.',
};

const LAST_UPDATED = 'June 18, 2026';

const SECTIONS = [
  {
    id: 'information-we-collect',
    title: '1. Information We Collect',
    content: `We collect information you provide directly to us when you create an account, complete your profile, apply for jobs, or contact us.

**Account information:** Name, email address, password (hashed), phone number, and role (candidate or recruiter).

**Profile information (candidates):** Resume, work experience, education, skills, profile photo, LinkedIn URL, and job preferences.

**Company information (recruiters):** Company name, website, industry, logo, and billing details.

**Usage data:** Pages visited, features used, search queries, job views, and application activity. This is collected automatically via cookies and server logs.

**Device data:** IP address, browser type, operating system, and referring URLs — used for security and analytics.`,
  },
  {
    id: 'how-we-use',
    title: '2. How We Use Your Information',
    content: `We use the information we collect to:

- Create and manage your account
- Match candidates with relevant job opportunities
- Enable direct communication between candidates and recruiters
- Send transactional emails (OTP codes, application updates, interview notifications)
- Send optional job alert emails (you can unsubscribe at any time)
- Improve our matching algorithms and platform features
- Detect and prevent fraud, spam, and abuse
- Comply with legal obligations

We do not sell your personal data to third parties. We do not share your resume or contact details with recruiters without your explicit action (applying to a job or initiating contact).`,
  },
  {
    id: 'sharing',
    title: '3. Information Sharing',
    content: `We share your information only in these circumstances:

**With recruiters:** When you apply to a job or message a recruiter, your profile and resume are shared with that specific recruiter. You control which companies see your profile.

**Service providers:** We use trusted third-party services for hosting (Vercel), database (MongoDB Atlas), email delivery, and analytics. These providers process data only on our behalf under strict confidentiality agreements.

**Legal requirements:** We may disclose information when required by law, court order, or to protect the rights, property, or safety of itJobwala, our users, or others.

**Business transfers:** In the event of a merger, acquisition, or sale of assets, user data may be transferred. We will notify you before your data is transferred and becomes subject to a different privacy policy.`,
  },
  {
    id: 'data-retention',
    title: '4. Data Retention',
    content: `We retain your data for as long as your account is active or as needed to provide services.

**Active accounts:** Data is retained indefinitely while your account remains active.

**Deleted accounts:** When you delete your account, we remove your personal information within 30 days, except where we are required to retain it for legal, tax, or fraud-prevention purposes.

**Application data:** Records of job applications are retained for 2 years to support disputes or recruiter hiring decisions.

**Anonymised data:** We may retain aggregated, anonymised usage statistics indefinitely for platform analytics.`,
  },
  {
    id: 'cookies',
    title: '5. Cookies & Tracking',
    content: `We use cookies and similar technologies to:

- Keep you signed in (authentication tokens stored in localStorage)
- Remember your preferences
- Analyse platform usage via aggregated, anonymised analytics

We do not use third-party advertising cookies. You can disable cookies in your browser settings, but some features (such as staying signed in) will not work without them.`,
  },
  {
    id: 'security',
    title: '6. Security',
    content: `We take the security of your data seriously:

- Passwords are hashed using bcrypt and never stored in plain text
- All data is transmitted over HTTPS (TLS 1.2+)
- Access to production databases is restricted to authorised personnel only
- We use JWT tokens with expiry for session management
- We conduct periodic security reviews

No system is 100% secure. If you discover a security vulnerability, please report it responsibly to security@itjobwala.com.`,
  },
  {
    id: 'your-rights',
    title: '7. Your Rights',
    content: `You have the following rights over your data:

**Access:** Request a copy of the personal data we hold about you.

**Correction:** Update or correct inaccurate information directly from your profile page, or by contacting us.

**Deletion:** Request deletion of your account and associated personal data.

**Portability:** Request an export of your data in a machine-readable format.

**Opt-out:** Unsubscribe from marketing emails at any time via the unsubscribe link or your account settings.

To exercise any of these rights, email us at privacy@itjobwala.com with the subject "Data Request".`,
  },
  {
    id: 'children',
    title: '8. Children\'s Privacy',
    content: `itJobwala is intended for users who are 18 years of age or older. We do not knowingly collect personal information from anyone under 18. If you believe a minor has provided us with personal information, please contact us and we will promptly delete it.`,
  },
  {
    id: 'changes',
    title: '9. Changes to This Policy',
    content: `We may update this Privacy Policy from time to time. When we make material changes, we will notify you by email or by displaying a prominent notice on the platform. The "Last updated" date at the top of this page reflects the most recent revision.

Continued use of itJobwala after changes take effect constitutes acceptance of the updated policy.`,
  },
  {
    id: 'contact',
    title: '10. Contact Us',
    content: `For any privacy-related questions or requests, contact us at:

**Email:** privacy@itjobwala.com
**General:** hello@itjobwala.com
**Address:** Hyderabad, Telangana, India`,
  },
];

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-surface">
      <SmartNavbar />

      <div className="pt-16 lg:pt-[72px]">
        {/* Hero */}
        <div className="bg-surface-alt border-b border-token">
          <div className="max-w-[860px] mx-auto px-5 sm:px-8 py-14">
            <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 text-primary text-xs font-bold px-4 py-1.5 mb-5 uppercase tracking-widest">
              Legal
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-heading mb-3" style={{ letterSpacing: '-1px' }}>
              Privacy Policy
            </h1>
            <p className="text-sm text-muted">Last updated: {LAST_UPDATED}</p>
            <p className="text-base text-muted mt-4 leading-relaxed max-w-2xl">
              This policy explains what data itJobwala collects, why we collect it, and how you can control it. We believe in plain English — no legal jargon.
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-[860px] mx-auto px-5 sm:px-8 py-12">
          <div className="grid lg:grid-cols-[220px_1fr] gap-12 items-start">

            {/* TOC — sticky on desktop */}
            <nav className="hidden lg:block sticky top-24">
              <p className="text-xs font-bold uppercase tracking-widest text-muted mb-3">Contents</p>
              <ul className="flex flex-col gap-1">
                {SECTIONS.map(s => (
                  <li key={s.id}>
                    <a
                      href={`#${s.id}`}
                      className="text-sm text-muted hover:text-primary transition-colors leading-snug block py-0.5"
                    >
                      {s.title}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Body */}
            <article className="flex flex-col gap-10">
              {SECTIONS.map(s => (
                <section key={s.id} id={s.id} className="scroll-mt-28">
                  <h2 className="text-lg font-extrabold text-heading mb-4">{s.title}</h2>
                  <div className="flex flex-col gap-3">
                    {s.content.split('\n\n').map((para, i) => {
                      if (para.startsWith('**') && para.endsWith('**')) {
                        return (
                          <p key={i} className="text-sm font-bold text-heading">
                            {para.slice(2, -2)}
                          </p>
                        );
                      }
                      if (para.startsWith('- ')) {
                        return (
                          <ul key={i} className="flex flex-col gap-1.5 ml-4">
                            {para.split('\n').map((line, j) => (
                              <li key={j} className="text-sm text-muted leading-relaxed list-disc">
                                {line.replace(/^- /, '')}
                              </li>
                            ))}
                          </ul>
                        );
                      }
                      // Render inline bold (**text**)
                      const parts = para.split(/(\*\*[^*]+\*\*)/g);
                      return (
                        <p key={i} className="text-sm text-muted leading-relaxed">
                          {parts.map((part, j) =>
                            part.startsWith('**') && part.endsWith('**')
                              ? <strong key={j} className="font-semibold text-heading">{part.slice(2, -2)}</strong>
                              : part
                          )}
                        </p>
                      );
                    })}
                  </div>
                </section>
              ))}

              <div className="border-t border-token pt-8">
                <p className="text-sm text-muted">
                  Questions? <a href="/contact" className="text-primary font-semibold hover:underline">Contact us</a> or email{' '}
                  <a href="mailto:privacy@itjobwala.com" className="text-primary font-semibold hover:underline">privacy@itjobwala.com</a>.
                </p>
              </div>
            </article>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
