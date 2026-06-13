import type { Metadata } from 'next';
import { AdminReportsPage } from '@/src/features/admin';

export const metadata: Metadata = {
  title: 'Reports – itJobwala Admin',
};

export default function Page() {
  return <AdminReportsPage />;
}
