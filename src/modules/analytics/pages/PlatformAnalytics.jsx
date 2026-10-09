import React from "react";
import { PieChart } from "../charts/PieChart";
import { mockPlatform } from "../data/mockPlatform";

export const PlatformAnalytics = () => (
  <div className="rounded-lg border border-card-border bg-card p-6 space-y-4">
    <h3 className="text-base font-bold text-text-primary">Reach Share by Platform</h3>
    <PieChart data={mockPlatform.breakdown} />
  </div>
);

export default PlatformAnalytics;
