import React from "react";
import { RankedList } from "../components/RankedList";
import { mockContent } from "../data/mockContent";

export const ContentPerformance = () => (
  <div className="rounded-lg border border-card-border bg-card p-6 space-y-4">
    <h3 className="text-base font-bold text-text-primary">Top Performing DNA Content</h3>
    <RankedList items={mockContent.topPosts} />
  </div>
);

export default ContentPerformance;
