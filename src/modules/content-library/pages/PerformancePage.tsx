import React from "react";
import { useMetrics } from "../hooks/useMetrics";
import { useContent } from "../hooks/useContent";
import { MetricCard } from "../components/MetricCard";
import { ContentCard } from "../components/ContentCard";

export const PerformancePage: React.FC = () => {
  const metrics = useMetrics();
  const { items } = useContent();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Content Performance</h1>
        <p className="text-sm text-text-secondary">
          Measure how your Creator DNA scripts perform across platforms.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <MetricCard label="Total Saved Assets" value={String(metrics.totalSaved)} />
        <MetricCard label="Average DNA Fidelity" value={metrics.avgDnaMatch} />
        <MetricCard label="Top Converting Channel" value={metrics.topPlatform} />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {items.map((item) => (
          <ContentCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
};

export default PerformancePage;
