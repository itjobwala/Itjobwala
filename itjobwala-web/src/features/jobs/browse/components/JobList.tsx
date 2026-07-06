import type { Job } from '../../shared/types';
import JobCard from './JobCard';
import EmptyJobsState from './EmptyJobsState';
import JobListSkeleton from './JobListSkeleton';

interface Props {
  jobs: Job[];
  isLoading: boolean;
  onReset: () => void;
  savedJobIds?: Set<string>;
  onSaveJob?: (jobId: string) => Promise<void>;
  onUnsaveJob?: (jobId: string) => Promise<void>;
}

export default function JobList({ jobs, isLoading, onReset, savedJobIds, onSaveJob, onUnsaveJob }: Props) {
  if (isLoading) return <JobListSkeleton count={6} />;
  if (jobs.length === 0) return <EmptyJobsState onReset={onReset} />;

  return (
    <div className="flex flex-col gap-4">
      {jobs.map(job => (
        <JobCard
          key={job.id}
          job={job}
          initialSaved={savedJobIds?.has(job.id) ?? false}
          onSave={onSaveJob}
          onUnsave={onUnsaveJob}
          matchScore={job.jobFitScore ?? null}
        />
      ))}
    </div>
  );
}
