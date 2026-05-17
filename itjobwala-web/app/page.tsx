'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthHydration } from '@/src/hooks/useAuthHydration';
import SmartNavbar from "@/src/components/SmartNavbar";
import HeroSection from "@/src/components/HeroSection";
import StatsStrip from "@/src/components/StatsStrip";
import CompanyMarquee from "@/src/components/CompanyMarquee";
import CategorySection from "@/src/components/CategorySection";
import FeaturedJobs from "@/src/components/FeaturedJobs";
import HowItWorks from "@/src/components/HowItWorks";
import WhyUs from "@/src/components/WhyUs";
import Testimonials from "@/src/components/Testimonials";
import FAQ from "@/src/components/FAQ";
import RecruiterCTA from "@/src/components/RecruiterCTA";
import Footer from "@/src/components/Footer";

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
