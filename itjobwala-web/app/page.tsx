'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthHydration } from '@/src/hooks/useAuthHydration';
import { SmartNavbar } from "@/layout/navbar";
import {
  HeroSection, StatsStrip, CompanyMarquee, CategorySection,
  FeaturedJobs, HowItWorks, WhyUs, Testimonials,
  FAQ, RecruiterCTA, Footer,
} from '@/features/home';

export default function Home() {
  const router = useRouter();
  const { isHydrated, session, isLoading } = useAuthHydration();

  useEffect(() => {
    if (!isHydrated || isLoading) return;

    if (session?.userRole === 'candidate') {
      router.replace('/jobs');
    }
  }, [isHydrated, isLoading, router, session]);

  if (!isHydrated || isLoading || session?.userRole === 'candidate') {
    return null;
  }

  return (
    <main className="min-h-screen">
      <SmartNavbar />
      <HeroSection />
      <StatsStrip />
      <CompanyMarquee />
      <CategorySection />
      <FeaturedJobs />
      <HowItWorks />
      <WhyUs />
      <Testimonials />
      <FAQ />
      <RecruiterCTA />
      <Footer />
    </main>
  );
}
