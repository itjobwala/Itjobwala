import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getJobById } from '@/features/jobs/shared';
import { normalizeJobDetail } from '@/features/jobs/detail';
import type { JobDetail as ApiJobDetail } from '@/features/jobs/shared/types/apiJobs.types';
import { env } from '@/src/env';
import PublicJobDetail from './PublicJobDetail';

interface Props {
  params: Promise<{ id: string }>;
}

const EMP_TYPE: Record<string, string> = {
  'full-time': 'FULL_TIME',
  'part-time': 'PART_TIME',
  contract: 'CONTRACTOR',
  internship: 'INTERN',
};
const UNIT_TEXT: Record<string, string> = {
  annual: 'YEAR',
  monthly: 'MONTH',
};

function buildJsonLd(job: ApiJobDetail, jobUrl: string): Record<string, unknown> {
  const ld: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title: job.title,
    description: job.description || `${job.title} at ${job.company}`,
    datePosted: job.posted_at,
    employmentType: EMP_TYPE[job.job_type] ?? 'FULL_TIME',
    url: jobUrl,
    hiringOrganization: {
      '@type': 'Organization',
      name: job.company,
      ...(job.company_logo ? { logo: job.company_logo } : {}),
      ...(job.company_website ? { sameAs: job.company_website } : {}),
    },
    jobLocation: {
      '@type': 'Place',
      address: {
        '@type': 'PostalAddress',
        addressLocality: job.location,
        addressCountry: 'IN',
      },
    },
  };

  if (job.closes_at) ld.validThrough = job.closes_at;

  if (job.work_mode === 'remote') {
    ld.jobLocationType = 'TELECOMMUTE';
    ld.applicantLocationRequirements = { '@type': 'Country', name: 'IN' };
  }

  if (job.salary_min && job.salary_max) {
    ld.baseSalary = {
      '@type': 'MonetaryAmount',
      currency: job.salary_currency || 'INR',
      value: {
        '@type': 'QuantitativeValue',
        minValue: job.salary_min,
        maxValue: job.salary_max,
        unitText: UNIT_TEXT[job.salary_period] ?? 'YEAR',
      },
    };
  }

  return ld;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  try {
    const job = await getJobById(id);
    const canonical = `${env.siteUrl}/jobs/${id}`;
    return {
      title: `${job.title} at ${job.company} – itJobwala`,
      description: `${job.title} at ${job.company} in ${job.location}. ${job.experience_min}–${job.experience_max} years experience. Apply on itJobwala.`,
      alternates: { canonical },
      openGraph: {
        title: `${job.title} at ${job.company}`,
        description: `${job.title} in ${job.location}. ${job.job_type.replace('-', ' ')} role.`,
        url: canonical,
        type: 'website',
        ...(job.company_logo ? { images: [{ url: job.company_logo }] } : {}),
      },
    };
  } catch {
    return { title: 'Job Not Found – itJobwala' };
  }
}

export default async function PublicJobPage({ params }: Props) {
  const { id } = await params;
  let apiJob: ApiJobDetail | undefined;
  try {
    apiJob = await getJobById(id);
  } catch {
    notFound();
  }

  if (apiJob!.status !== 'active') notFound();

  const jobUrl = `${env.siteUrl}/jobs/${id}`;
  const jsonLd = buildJsonLd(apiJob!, jobUrl);
  const job = normalizeJobDetail(apiJob!);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PublicJobDetail job={job} jobId={id} />
    </>
  );
}
