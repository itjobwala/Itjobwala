import { SmartNavbar } from '@/layout/navbar';
import { Footer } from '@/features/home';

export const metadata = {
  title: 'Terms of Service — itJobwala',
  description: 'The terms that govern your use of itJobwala — India\'s IT job platform.',
};

const LAST_UPDATED = 'June 18, 2026';

const SECTIONS = [
  {
    id: 'acceptance',
    title: '1. Acceptance of Terms',
    content: `By accessing or using itJobwala ("the Platform"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, do not use the Platform.

These Terms apply to all users, including candidates, recruiters, and visitors. We may update these Terms from time to time. Continued use of the Platform after any update constitutes acceptance of the revised Terms.`,
  },
  {
    id: 'eligibility',
    title: '2. Eligibility',
    content: `You must be at least 18 years old to use itJobwala. By creating an account, you confirm that:

- You are at least 18 years of age
- You have the legal capacity to enter into a binding agreement
- You are not barred from using the Platform under applicable law
- All registration information you provide is accurate and current`,
  },
  {
    id: 'accounts',
    title: '3. Accounts',
    content: `**Registration:** You must create an account to apply for jobs or post job listings. You are responsible for maintaining the confidentiality of your login credentials.

**One account per person:** Candidates may not create multiple accounts. Recruiters may create one account per company.

**Accurate information:** You agree to provide accurate, current, and complete information during registration and to keep your profile up to date.

**Account security:** You are responsible for all activity that occurs under your account. Notify us immediately at hello@itjobwala.com if you suspect unauthorised access.

**Termination by you:** You may delete your account at any time from your account settings.`,
  },
  {
    id: 'candidate-terms',
    title: '4. Candidate Terms',
    content: `As a candidate, you agree to:

- Provide truthful and accurate information in your profile and resume
- Not impersonate any person or misrepresent your qualifications
- Apply only for positions for which you are genuinely interested
- Not use automated tools or bots to scrape jobs or submit bulk applications
- Respond to recruiter messages in a respectful and professional manner

**Profile visibility:** Your profile is visible to recruiters on the Platform. You can control visibility settings from your profile page.

**Applications:** By applying to a job, you consent to the recruiter viewing your profile and resume for that application.`,
  },
  {
    id: 'recruiter-terms',
    title: '5. Recruiter Terms',
    content: `As a recruiter, you agree to:

- Post only genuine, available job openings at your registered company
- Not post roles that are misleading, fraudulent, or discriminatory
- Not use candidate data obtained through itJobwala for any purpose other than evaluating candidates for the posted role
- Respond to applications within a reasonable timeframe and update application statuses
- Not share candidate profiles or resumes with third parties without the candidate's consent
- Comply with all applicable employment laws, including equal opportunity requirements

**Job posting standards:** We reserve the right to remove job postings that violate these standards without notice.

**Candidate data:** You may not export, store, or use candidate data beyond the scope of the hiring process for the specific role.`,
  },
  {
    id: 'prohibited',
    title: '6. Prohibited Conduct',
    content: `You must not:

- Post false, misleading, or fraudulent content
- Harass, threaten, or abuse other users
- Use the Platform to send spam or unsolicited commercial messages
- Attempt to gain unauthorised access to any part of the Platform or other user accounts
- Reverse-engineer, decompile, or attempt to extract source code from the Platform
- Use automated tools, bots, or scrapers to collect data from the Platform
- Post content that infringes intellectual property rights, is defamatory, or violates any applicable law
- Circumvent any access controls or security measures
- Create fake accounts or impersonate other users or companies`,
  },
  {
    id: 'content',
    title: '7. User Content',
    content: `**Your content:** You retain ownership of the content you submit (resumes, job descriptions, messages). By submitting content, you grant itJobwala a non-exclusive, worldwide, royalty-free licence to store, display, and use that content solely to operate and improve the Platform.

**Content standards:** You are solely responsible for the accuracy and legality of content you post. We do not verify the accuracy of job postings or candidate profiles.

**Removal:** We reserve the right to remove any content that violates these Terms or our policies, without notice.`,
  },
  {
    id: 'intellectual-property',
    title: '8. Intellectual Property',
    content: `The itJobwala name, logo, platform design, code, and all related intellectual property are owned by itJobwala and are protected by applicable intellectual property laws.

You may not copy, reproduce, distribute, or create derivative works from any part of the Platform without our express written permission.`,
  },
  {
    id: 'disclaimers',
    title: '9. Disclaimers',
    content: `**No employment guarantee:** itJobwala is a platform connecting candidates and recruiters. We do not guarantee job placements, interview invitations, or hiring outcomes.

**No endorsement:** We do not endorse or verify any recruiter, company, or job posting. Candidates should conduct their own due diligence before accepting any offer.

**Platform availability:** We strive for high availability but do not guarantee uninterrupted access to the Platform. We may perform maintenance, updates, or experience outages.

**"As is" service:** The Platform is provided "as is" without warranties of any kind, express or implied, including merchantability or fitness for a particular purpose.`,
  },
  {
    id: 'limitation',
    title: '10. Limitation of Liability',
    content: `To the maximum extent permitted by applicable law, itJobwala shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of — or inability to use — the Platform.

Our total liability to you for any claim arising from these Terms or your use of the Platform shall not exceed the amount you paid to itJobwala in the 12 months preceding the claim (or ₹1,000 if you have not made any payment).`,
  },
  {
    id: 'termination',
    title: '11. Termination',
    content: `We may suspend or terminate your account at any time, with or without notice, if we believe you have violated these Terms, engaged in fraudulent activity, or if required by law.

Upon termination, your right to access the Platform ceases immediately. Provisions of these Terms that by their nature should survive termination (including intellectual property, disclaimers, limitation of liability) will survive.`,
  },
  {
    id: 'governing-law',
    title: '12. Governing Law',
    content: `These Terms are governed by the laws of India. Any disputes arising from or related to these Terms or your use of the Platform shall be subject to the exclusive jurisdiction of the courts in Hyderabad, Telangana, India.

If any provision of these Terms is found to be unenforceable, the remaining provisions will remain in full effect.`,
  },
  {
    id: 'contact',
    title: '13. Contact',
    content: `For questions about these Terms, contact us at:

**Email:** legal@itjobwala.com
**General:** hello@itjobwala.com
**Address:** Hyderabad, Telangana, India`,
  },
];

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-surface">
      <SmartNavbar />

      <div className="pt-[68px]">
        {/* Hero */}
        <div className="bg-surface-alt border-b border-token">
          <div className="max-w-[860px] mx-auto px-5 sm:px-8 py-14">
            <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 text-primary text-xs font-bold px-4 py-1.5 mb-5 uppercase tracking-widest">
              Legal
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-heading mb-3" style={{ letterSpacing: '-1px' }}>
              Terms of Service
            </h1>
            <p className="text-sm text-muted">Last updated: {LAST_UPDATED}</p>
            <p className="text-base text-muted mt-4 leading-relaxed max-w-2xl">
              Please read these terms carefully before using itJobwala. They explain your rights and responsibilities as a user of our platform.
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-[860px] mx-auto px-5 sm:px-8 py-12">
          <div className="grid lg:grid-cols-[220px_1fr] gap-12 items-start">

            {/* TOC */}
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

              <div className="border-t border-token pt-8 flex flex-col sm:flex-row gap-4">
                <a href="/privacy" className="text-sm text-primary font-semibold hover:underline">
                  Privacy Policy →
                </a>
                <a href="/contact" className="text-sm text-primary font-semibold hover:underline">
                  Contact Us →
                </a>
              </div>
            </article>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
