import React from "react";
import { PieChart } from "../charts/PieChart";
import { BarChart } from "../charts/BarChart";
import { mockAudience } from "../data/mockAudience";

export const AudienceInsights = () => (
  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
    <div className="rounded-lg border border-card-border bg-card p-6">
      <h3 className="text-base font-bold text-text-primary mb-4">Audience Segments</h3>
      <PieChart data={mockAudience.demographics} />
    </div>
    <div className="rounded-lg border border-card-border bg-card p-6">
      <h3 className="text-base font-bold text-text-primary mb-4">Top Geographies (%)</h3>
      <BarChart data={mockAudience.topLocations} />
    </div>
  </div>
);

export default AudienceInsights;
