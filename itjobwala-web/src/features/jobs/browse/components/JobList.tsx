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
  candidateSkills?: string[];
}

function computeSkillMatch(
  candidateSkills: string[],
  jobSkills: string[]
): { score: number; matched: string[] } {
  if (!candidateSkills.length || !jobSkills.length) return { score: 0, matched: [] };
  const lower   = new Set(candidateSkills.map(s => s.toLowerCase()));
  const matched = jobSkills.filter(s => lower.has(s.toLowerCase()));
  const score   = Math.round((matched.length / jobSkills.length) * 100);
  return { score, matched };
}

export default function JobList({ jobs, isLoading, onReset, savedJobIds, onSaveJob, onUnsaveJob, candidateSkills = [] }: Props) {
  if (isLoading) return <JobListSkeleton count={6} />;
  if (jobs.length === 0) return <EmptyJobsState onReset={onReset} />;

  const showMatch = candidateSkills.length >= 3;

  return (
    <div className="flex flex-col gap-4">
      {jobs.map(job => {
        const { score, matched } = showMatch ? computeSkillMatch(candidateSkills, job.skills ?? []) : { score: 0, matched: [] };
        return (
          <JobCard
            key={job.id}
            job={job}
            initialSaved={savedJobIds?.has(job.id) ?? false}
            onSave={onSaveJob}
            onUnsave={onUnsaveJob}
            matchScore={showMatch ? score : null}
            matchedSkills={matched}
          />
        );
      })}
    </div>
  );
}
