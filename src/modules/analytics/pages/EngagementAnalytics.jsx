import React from "react";
import { BarChart } from "../charts/BarChart";
import { mockEngagement } from "../data/mockEngagement";

export const EngagementAnalytics = () => (
  <div className="rounded-lg border border-card-border bg-card p-6 space-y-4">
    <h3 className="text-base font-bold text-text-primary">Engagement Rate by Day (%)</h3>
    <BarChart data={mockEngagement.byDay} />
  </div>
);

export default EngagementAnalytics;
