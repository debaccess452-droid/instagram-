import React from "react";

export const MetricCard: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="rounded-lg border border-card-border bg-card p-4">
    <p className="text-xs text-text-secondary">{label}</p>
    <p className="mt-1 text-xl font-extrabold text-text-primary">{value}</p>
  </div>
);

export default MetricCard;
