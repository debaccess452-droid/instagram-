import React from "react";
import { ResultsHeader } from "../components/ResultsHeader";
import { OverallScoreCard } from "../components/OverallScoreCard";
import { MetricsGrid } from "../components/MetricsGrid";
import { GeneratedContentList } from "../components/GeneratedContentList";

export const ResultsOverview: React.FC = () => (
  <div className="space-y-6">
    <ResultsHeader />
    <OverallScoreCard />
    <MetricsGrid />
    <GeneratedContentList />
  </div>
);

export default ResultsOverview;
