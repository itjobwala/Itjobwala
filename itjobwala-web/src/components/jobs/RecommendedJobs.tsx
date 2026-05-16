import Link from 'next/link';
import type { Job } from './types';
import RecommendedJobCard from './RecommendedJobCard';

interface Props {
  jobs: Job[];
}

export default function RecommendedJobs({ jobs }: Props) {
  if (jobs.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5">
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
    </div>
  );
}
