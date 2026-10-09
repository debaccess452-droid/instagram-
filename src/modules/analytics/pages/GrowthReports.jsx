import React from "react";
import { LineChart } from "../charts/LineChart";
import { mockGrowth } from "../data/mockGrowth";

export const GrowthReports = () => (
  <div className="rounded-lg border border-card-border bg-card p-6 space-y-4">
    <h3 className="text-base font-bold text-text-primary">Cumulative Audience Growth</h3>
    <LineChart data={mockGrowth.followers} />
  </div>
);

export default GrowthReports;
