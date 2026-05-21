'use client';

import type { JobDetail } from './types';
import Card from '@/src/components/ui/Card';

interface Props {
  job: JobDetail;
}

export default function ApplyCard({ job }: Props) {
  return (
    <Card overflow>{null}</Card>
  );
}
