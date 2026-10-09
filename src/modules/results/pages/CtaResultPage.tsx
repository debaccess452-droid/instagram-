import React from "react";
import { ContentPageHeader } from "../components/content/ContentPageHeader";
import { CtaCard } from "../components/content/CtaCard";
import { ContentBottomBar } from "../components/content/ContentBottomBar";

export const CtaResultPage: React.FC = () => (
  <div className="space-y-6">
    <ContentPageHeader
      title="Conversion CTAs"
      subtitle="Optimized calls-to-action for DM triggers and bookmarks."
    />
    <CtaCard />
    <ContentBottomBar />
  </div>
);

export default CtaResultPage;
