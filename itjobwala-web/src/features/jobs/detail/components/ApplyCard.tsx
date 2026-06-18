'use client';

import type { JobDetail } from '../../shared/types';
import Card from '@/src/components/ui/Card';

import StatusBadge from '@/src/components/ui/StatusBadge';
import Button from '@/src/components/ui/Button';
import Link from 'next/link';

interface Props {
  job: JobDetail;
  applied?: boolean;
  saved?: boolean;
  onSave?: () => void;
  onUnsave?: () => void;
  loading?: boolean;
}

export default function ApplyCard({ job, applied = false, saved = false, onSave, onUnsave, loading = false }: Props) {
  return (
    <Card padding="md" className="flex flex-col gap-4">
      {applied && (
        <div className="bg-surface-alt rounded-xl p-4 border border-token">
          <p className="text-sm font-bold text-heading mb-2">Application status</p>
          <StatusBadge status="applied" />
          <Link
            href="/candidate/applications"
            className="block mt-3 text-sm font-semibold text-primary hover:underline"
          >
            View application →
          </Link>
        </div>
      )}

      <Button fullWidth variant="secondary" onClick={saved ? onUnsave : onSave} disabled={loading}>
        {saved ? 'Saved ✓' : 'Save job'}
      </Button>

      <div className="flex items-center justify-between mt-1 pt-4 border-t border-token text-xs text-muted">
        <span>{job.applicants} applicants</span>
        <span>Posted {job.postedDaysAgo === 0 ? 'today' : `${job.postedDaysAgo}d ago`}</span>
      </div>
    </Card>
  );
}
