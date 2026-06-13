import type { Metadata } from 'next';
import { AdminJobQueuePage } from '@/src/features/admin';

export const metadata: Metadata = {
  title: 'Job Queue – itJobwala Admin',
};

export default function Page() {
  return <AdminJobQueuePage />;
}
