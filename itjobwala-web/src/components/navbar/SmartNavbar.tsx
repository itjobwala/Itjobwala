'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import Navbar from '@/src/components/navbar/Navbar';
import NavbarSkeleton from '@/src/components/navbar/NavbarSkeleton';
import { useAuthHydration } from '@/src/hooks/useAuthHydration';

/**
 * Dynamic AuthNavbar with SSR disabled
 *
 * Benefits:
 * - AuthNavbar only loaded when authenticated (smaller initial JS)
 * - NavbarSkeleton shown during dynamic loading
 * - No hydration mismatch (client-only rendering)
 *
 * Configuration:
 * Set NEXT_PUBLIC_DISABLE_AUTH_NAVBAR_SSR=true to enable dynamic loading
 * Default: false (renders normally for better initial load)
 */
const AuthNavbarDynamic = dynamic(
  () => import('@/src/components/navbar/AuthNavbar'),
  {
    // ssr: false means AuthNavbar only renders on client
    // Skeleton is shown during loading
    ssr: process.env.NEXT_PUBLIC_DISABLE_AUTH_NAVBAR_SSR === 'true',
    loading: () => <NavbarSkeleton />,
  }
);

/**
 * SmartNavbar - Production-grade hydration-aware navbar selector
 *
 * Features:
 * 1. Zero auth flicker - shows skeleton during hydration
 * 2. Stable layout - prevents CLS (Cumulative Layout Shift)
 * 3. Zustand aware - waits for external store hydration
 * 4. Proper auth state - loads after hydration complete
 * 5. Dynamic import option - reduces bundle for SSR pages
 *
 * Architecture:
 * - Server: Always renders <Navbar /> (stable, public navbar)
 * - Client hydration: Shows <NavbarSkeleton /> (prevents flicker)
 * - Client post-hydration:
 *   - Authenticated: <AuthNavbarDynamic /> (auth-dependent UI)
 *   - Unauthenticated: <Navbar /> (public navbar)
 *
 * This ensures initial HTML always matches (preventing hydration errors)
 * while showing proper auth UI after hydration completes.
 */
export default function SmartNavbar() {
  const { isHydrated, session, isLoading } = useAuthHydration();

  // During hydration and auth loading: show skeleton
  // Prevents layout shift, auth flicker, and CLS
  if (!isHydrated || isLoading) {
    return <NavbarSkeleton />;
  }

  // After hydration: render appropriate navbar
  if (session) {
    return (
      <Suspense fallback={<NavbarSkeleton />}>
        <AuthNavbarDynamic user={session} />
      </Suspense>
    );
  }

  // Unauthenticated users: render public navbar
  return <Navbar />;
}
