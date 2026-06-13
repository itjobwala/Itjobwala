import type { Metadata } from 'next';
import { AdminJobsPage } from '@/src/features/admin';

export const metadata: Metadata = {
  title: 'Jobs – itJobwala Admin',
};

export default function Page() {
  return <AdminJobsPage />;
}
