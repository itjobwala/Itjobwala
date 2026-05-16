import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import JobDetailPageClient from '@/src/components/jobs/JobDetailPageClient';
import { getJobById } from '@/src/lib/api/jobs';
import { normalizeJobDetail } from '@/src/components/jobs/types';

interface Props {
  params: Promise<{ id: string }>;
}

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  try {
    const job = await getJobById(id);
    return {
      title:       `${job.title} at ${job.company} – itJobwala`,
      description: `${job.title} at ${job.company} in ${job.location}.`,
    };
  } catch {
    return { title: 'Job Not Found – itJobwala' };
  }
}

export default async function JobDetailPage({ params }: Props) {
  const { id } = await params;

  let apiJob;
  try {
    apiJob = await getJobById(id);
  } catch {
    notFound();
  }

  const job = normalizeJobDetail(apiJob!);

  return <JobDetailPageClient job={job} />;
}
