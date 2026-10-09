import React from "react";
import { Navbar, Footer } from "@/components/layout";
import { Hero } from "./sections/Hero";
import { SocialProof } from "./sections/SocialProof";
import { Problem } from "./sections/Problem";
import { Solution } from "./sections/Solution";
import { Features } from "./sections/Features";
import { HowItWorks } from "./sections/HowItWorks";
import { CreatorProfile } from "./sections/CreatorProfile";
import { DashboardShowcase } from "./sections/DashboardShowcase";
import { TrendDiscovery } from "./sections/TrendDiscovery";
import { WeeklyTrendReport } from "./sections/WeeklyTrendReport";
import { Testimonials } from "./sections/Testimonials";
import { PricingPreview } from "./sections/PricingPreview";
import { FAQ } from "./sections/FAQ";
import { FinalCTA } from "./sections/FinalCTA";

export const Landing: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background text-text-primary">
      <Navbar />
      <main className="flex-1">
        <Hero />
        <SocialProof />
        <Problem />
        <Solution />
        <Features />
        <HowItWorks />
        <CreatorProfile />
        <DashboardShowcase />
        <TrendDiscovery />
        <WeeklyTrendReport />
        <Testimonials />
        <PricingPreview />
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
};

export default Landing;
