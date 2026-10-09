import React, { useState } from "react";
import { AnalyticsScope } from "../components/AnalyticsScope";
import { SectionHeader } from "../components/SectionHeader";
import { FilterBar } from "../components/FilterBar";
import { StatCard } from "../components/StatCard";
import { AreaChart } from "../charts/AreaChart";
import { useMockData } from "../hooks/useMockData";
import { AudienceInsights } from "./AudienceInsights";
import { ContentPerformance } from "./ContentPerformance";
import { BestPostingTime } from "./BestPostingTime";

export const AnalyticsDashboard = () => {
  const [range, setRange] = useState("30d");
  const { dashboard } = useMockData();

  return (
    <AnalyticsScope>
      <SectionHeader
        title="Creator Analytics & Voice ROI"
        subtitle="Track reach, hook retention, and cross-platform growth powered by your Creator DNA."
        right={<FilterBar activeRange={range} onRangeChange={setRange} />}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {dashboard.kpis.map((kpi) => (
          <StatCard
            key={kpi.label}
            label={kpi.label}
            value={kpi.value}
            delta={kpi.delta}
            positive={kpi.positive}
          />
        ))}
      </div>

      <div className="rounded-lg border border-card-border bg-card p-6 space-y-4">
        <h3 className="text-base font-bold text-text-primary">Reach Velocity ({range.toUpperCase()})</h3>
        <AreaChart data={dashboard.reachTrend} />
      </div>

      <ContentPerformance />
      <AudienceInsights />
      <BestPostingTime />
    </AnalyticsScope>
  );
};

export default AnalyticsDashboard;
