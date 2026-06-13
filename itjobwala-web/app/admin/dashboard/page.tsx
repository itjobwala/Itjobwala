import type { Metadata } from 'next';
import { AdminDashboardPage } from '@/src/features/admin';

export const metadata: Metadata = {
  title: 'Dashboard – itJobwala Admin',
};

export default function Page() {
  return <AdminDashboardPage />;
}
