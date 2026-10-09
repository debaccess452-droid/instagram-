import React from "react";
import { ContentPageHeader } from "../components/content/ContentPageHeader";
import { ReelScriptCard } from "../components/content/ReelScriptCard";
import { ContentBottomBar } from "../components/content/ContentBottomBar";

export const ReelScriptResultPage: React.FC = () => (
  <div className="space-y-6">
    <ContentPageHeader
      title="Instagram Reel Script"
      subtitle="30-second spoken script calibrated to your voice cadence."
    />
    <ReelScriptCard />
    <ContentBottomBar />
  </div>
);

export default ReelScriptResultPage;
