import type { Metadata } from 'next';
import NotificationsPageClient from '@/features/candidate/notifications/components/NotificationsPageClient';

export const metadata: Metadata = {
  title: 'Notifications – itJobwala',
  description: 'Your notifications inbox.',
};

export default function NotificationsPage() {
  return <NotificationsPageClient />;
}
