import React from "react";
import { ContentPageHeader } from "../components/content/ContentPageHeader";
import { ThreadCard } from "../components/content/ThreadCard";
import { ContentBottomBar } from "../components/content/ContentBottomBar";

export const ThreadsResultPage: React.FC = () => (
  <div className="space-y-6">
    <ContentPageHeader
      title="X / Threads Sequence"
      subtitle="Multi-post thread structured for maximum read-through."
    />
    <ThreadCard />
    <ContentBottomBar />
  </div>
);

export default ThreadsResultPage;
