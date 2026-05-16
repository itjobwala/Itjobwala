'use client';

import type { JobDetail } from './types';

interface Props {
  job: JobDetail;
}

export default function ApplyCard({ job }: Props) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5">
    </div>
  );
}
