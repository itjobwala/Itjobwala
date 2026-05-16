'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
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
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      router.replace('/jobs');
    } else {
      setIsChecking(false);
    }
  }, [router]);

  if (isChecking) {
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
