import React from "react";
import { HooksPageHeader } from "../components/HooksPageHeader";
import { HookScoreCard } from "../components/HookScoreCard";
import { HooksList } from "../components/HooksList";
import { HooksBottomBar } from "../components/HooksBottomBar";

export const HooksResultsPage: React.FC = () => (
  <div className="space-y-6">
    <HooksPageHeader />
    <HookScoreCard />
    <HooksList />
    <HooksBottomBar />
  </div>
);

export default HooksResultsPage;
