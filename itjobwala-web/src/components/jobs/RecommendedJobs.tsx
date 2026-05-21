import Link from 'next/link';
import type { Job } from './types';
import RecommendedJobCard from './RecommendedJobCard';
import Card from '@/src/components/ui/Card';

interface Props {
  jobs: Job[];
}

export default function RecommendedJobs({ jobs }: Props) {
  if (jobs.length === 0) return null;

  return (
    <Card overflow>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[14px] font-extrabold text-[#0f172a]">Recommended for you</h3>
        <Link href="/jobs" className="text-[12px] font-semibold text-primary hover:underline">
          View all
        </Link>
      </div>
      <div className="flex flex-col">
        {jobs.map(job => (
          <RecommendedJobCard key={job.id} job={job} />
        ))}
      </div>
    </Card>
  );
}
