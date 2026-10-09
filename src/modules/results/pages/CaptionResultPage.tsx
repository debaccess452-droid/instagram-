import React from "react";
import { ContentPageHeader } from "../components/content/ContentPageHeader";
import { CaptionCard } from "../components/content/CaptionCard";
import { ContentBottomBar } from "../components/content/ContentBottomBar";

export const CaptionResultPage: React.FC = () => (
  <div className="space-y-6">
    <ContentPageHeader
      title="Story-Driven Caption"
      subtitle="Formatted for Instagram & LinkedIn read-through and saves."
    />
    <CaptionCard />
    <ContentBottomBar />
  </div>
);

export default CaptionResultPage;
