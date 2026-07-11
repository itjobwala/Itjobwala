import type { JobDetail } from '../../shared/types';
import CompanyLogo from '@/src/components/ui/CompanyLogo';
import Card from '@/src/components/ui/Card';
import { hashColor } from '@/src/lib/utils/format';

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-base font-extrabold text-heading mb-3" style={{ letterSpacing: '-0.3px' }}>
      {children}
    </h2>
  );
}

function BulletItem({ text }: { text: string }) {
  return (
    <li className="flex items-start gap-3 text-sm text-[#474d6a] leading-[1.65]">
      <span className="mt-[6.5px] w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
      {text}
    </li>
  );
}

interface Props {
  job: JobDetail;
}

export default function JobDescription({ job }: Props) {
  const colorClass = job.companyColorClass || hashColor(job.company);

  return (
    <Card padding="none" className="p-6 sm:p-8 flex flex-col gap-8" overflow>
      {/* Job Overview */}
      {job.description && (
        <>
          <section>
            <SectionHeading>Overview</SectionHeading>
            <p className="text-sm text-[#474d6a] leading-[1.75]">{job.description}</p>
          </section>
          <div className="h-px bg-token" />
        </>
      )}

      {/* About company */}
      <section>
        <SectionHeading>About {job.company}</SectionHeading>
        <div className="flex items-center gap-3 mb-4">
          <CompanyLogo
            name={job.company}
            logo={job.companyLogo}
            colorClass={colorClass}
            className="w-10 h-10 rounded-xl"
            textClassName="text-base"
          />
          <div>
            <p className="text-sm font-bold text-heading">{job.company}</p>
            <p className="text-caption text-[#474d6a]">{job.companyIndustry} &middot; {job.companySize} &middot; Est. {job.companyFounded}</p>
          </div>
        </div>
        <p className="text-sm text-[#474d6a] leading-[1.75]">{job.aboutCompany}</p>
      </section>

      <div className="h-px bg-token" />

      {/* Responsibilities */}
      <section>
        <SectionHeading>What you&apos;ll do</SectionHeading>
        <ul className="flex flex-col gap-2.5">
          {job.responsibilities.map((r, i) => <BulletItem key={i} text={r} />)}
        </ul>
      </section>

      <div className="h-px bg-token" />

      {/* Requirements */}
      <section>
        <SectionHeading>What we&apos;re looking for</SectionHeading>
        <ul className="flex flex-col gap-2.5">
          {job.requirements.map((r, i) => <BulletItem key={i} text={r} />)}
        </ul>
      </section>

      {job.niceToHave.length > 0 && (
        <>
          <div className="h-px bg-token" />
          <section>
            <SectionHeading>Nice to have</SectionHeading>
            <ul className="flex flex-col gap-2.5">
              {job.niceToHave.map((r, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-[#474d6a] leading-[1.65]">
                  <span className="mt-[6.5px] w-1.5 h-1.5 rounded-full bg-gray-300 shrink-0" />
                  {r}
                </li>
              ))}
            </ul>
          </section>
        </>
      )}

      {job.officeDetails && (
        <>
          <div className="h-px bg-token" />
          <section>
            <SectionHeading>Office setup</SectionHeading>
            <div className="bg-blue-50 rounded-xl px-4 py-3.5 border border-blue-100">
              <p className="text-sm text-blue-700 font-semibold">{job.officeDetails}</p>
            </div>
          </section>
        </>
      )}

      <div className="h-px bg-token" />

      {/* Benefits */}
      <section>
        <SectionHeading>Perks &amp; benefits</SectionHeading>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {job.benefits.map((b, i) => (
            <div key={i} className="flex items-center gap-2.5 bg-surface-alt rounded-xl px-3.5 py-3 border border-token">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="shrink-0 text-success">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span className="text-sm font-semibold text-body">{b}</span>
            </div>
          ))}
        </div>
      </section>
    </Card>
  );
}
