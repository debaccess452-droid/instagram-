import React from "react";
import { MetricCard } from "./MetricCard";

export const MetricsGrid: React.FC = () => (
  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
    <MetricCard label="Voice Fidelity Match" value="96%" />
    <MetricCard label="Predicted Hook Retention" value="78.4%" />
    <MetricCard label="Readability Grade" value="Grade 6 · Punchy" />
  </div>
);

export default MetricsGrid;
