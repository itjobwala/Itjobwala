'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthHydration } from '@/src/hooks/useAuthHydration';
import SmartNavbar from "@/src/components/navbar/SmartNavbar";
import HeroSection from "@/src/components/home/HeroSection";
import StatsStrip from "@/src/components/home/StatsStrip";
import CompanyMarquee from "@/src/components/home/CompanyMarquee";
import CategorySection from "@/src/components/home/CategorySection";
import FeaturedJobs from "@/src/components/home/FeaturedJobs";
import HowItWorks from "@/src/components/home/HowItWorks";
import WhyUs from "@/src/components/home/WhyUs";
import Testimonials from "@/src/components/home/Testimonials";
import FAQ from "@/src/components/home/FAQ";
import RecruiterCTA from "@/src/components/home/RecruiterCTA";
import Footer from "@/src/components/home/Footer";

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
