import React from "react";
import { ProcessingHeader } from "../components/ai-processing/ProcessingHeader";
import { DnaAnimation } from "../components/ai-processing/DnaAnimation";
import { ProgressCard } from "../components/ai-processing/ProgressCard";
import { StatsCard } from "../components/ai-processing/StatsCard";
import { WhatsNextCard } from "../components/ai-processing/WhatsNextCard";
import { PrivacyNote } from "../components/ai-processing/PrivacyNote";

export const AIProcessingPage: React.FC = () => (
  <div className="space-y-6">
    <div className="flex items-center gap-4">
      <DnaAnimation />
      <ProcessingHeader />
    </div>
    <StatsCard />
    <ProgressCard />
    <WhatsNextCard />
    <PrivacyNote />
  </div>
);

export default AIProcessingPage;
