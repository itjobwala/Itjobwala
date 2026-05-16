import { redirect } from 'next/navigation';

export default function Page() {
  redirect('/recruiter/login?tab=signup');
}
