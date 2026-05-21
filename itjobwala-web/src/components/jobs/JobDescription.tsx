import type { JobDetail } from './types';
import CompanyLogo from './CompanyLogo';
import Card from '@/src/components/ui/Card';

const COLOR_CLASSES = [
  'bg-blue-500',
  'bg-purple-500',
  'bg-pink-500',
  'bg-red-500',
  'bg-orange-500',
  'bg-yellow-500',
  'bg-green-500',
  'bg-teal-500',
  'bg-cyan-500',
  'bg-indigo-500',
];

function getColorClass(key: string): string {
  const hash = key.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return COLOR_CLASSES[hash % COLOR_CLASSES.length];
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-[16px] font-extrabold text-[#0f172a] mb-3" style={{ letterSpacing: '-0.3px' }}>
      {children}
    </h2>
  );
}

function BulletItem({ text }: { text: string }) {
  return (
    <li className="flex items-start gap-3 text-[14px] text-gray-600 leading-[1.65]">
      <span className="mt-[6px] w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
      {text}
    </li>
  );
}

interface Props {
  job: JobDetail;
}

export default function JobDescription({ job }: Props) {
  const colorClass = job.companyColorClass || getColorClass(job.company);

  return (
    <Card padding="none" className="p-6 sm:p-8 flex flex-col gap-8" overflow>
      {/* Job Overview */}
      {job.description && (
        <>
          <section>
            <SectionHeading>Overview</SectionHeading>
            <p className="text-[14px] text-gray-600 leading-[1.75]">{job.description}</p>
          </section>
          <div className="h-px bg-gray-100" />
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
            <p className="text-[13px] font-bold text-[#0f172a]">{job.company}</p>
            <p className="text-[12px] text-gray-400">{job.companyIndustry} &middot; {job.companySize} &middot; Est. {job.companyFounded}</p>
          </div>
        </div>
        <p className="text-[14px] text-gray-600 leading-[1.75]">{job.aboutCompany}</p>
      </section>

      <div className="h-px bg-gray-100" />

      {/* Responsibilities */}
      <section>
        <SectionHeading>What you&apos;ll do</SectionHeading>
        <ul className="flex flex-col gap-2.5">
          {job.responsibilities.map((r, i) => <BulletItem key={i} text={r} />)}
        </ul>
      </section>

      <div className="h-px bg-gray-100" />

      {/* Requirements */}
      <section>
        <SectionHeading>What we&apos;re looking for</SectionHeading>
        <ul className="flex flex-col gap-2.5">
          {job.requirements.map((r, i) => <BulletItem key={i} text={r} />)}
        </ul>
      </section>

      {job.niceToHave.length > 0 && (
        <>
          <div className="h-px bg-gray-100" />
          <section>
            <SectionHeading>Nice to have</SectionHeading>
            <ul className="flex flex-col gap-2.5">
              {job.niceToHave.map((r, i) => (
                <li key={i} className="flex items-start gap-3 text-[14px] text-gray-500 leading-[1.65]">
                  <span className="mt-[6px] w-1.5 h-1.5 rounded-full bg-gray-300 shrink-0" />
                  {r}
                </li>
              ))}
            </ul>
          </section>
        </>
      )}

      {job.officeDetails && (
        <>
          <div className="h-px bg-gray-100" />
          <section>
            <SectionHeading>Office setup</SectionHeading>
            <div className="bg-blue-50 rounded-xl px-4 py-3.5 border border-blue-100">
              <p className="text-[14px] text-blue-700 font-semibold">{job.officeDetails}</p>
            </div>
          </section>
        </>
      )}

      <div className="h-px bg-gray-100" />

      {/* Benefits */}
      <section>
        <SectionHeading>Perks &amp; benefits</SectionHeading>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {job.benefits.map((b, i) => (
            <div key={i} className="flex items-center gap-2.5 bg-gray-50 rounded-xl px-3.5 py-3 border border-gray-100">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" className="shrink-0">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span className="text-[13px] font-semibold text-gray-700">{b}</span>
            </div>
          ))}
        </div>
      </section>
    </Card>
  );
}
