import React from "react";
import type { StatItem } from "../../types/dashboard";

export const StatsCard: React.FC<{ item: StatItem }> = ({ item }) => (
  <div className="rounded-lg border border-card-border bg-card p-5 shadow-dm-card">
    <p className="text-xs text-text-secondary">{item.label}</p>
    <p className="mt-2 text-2xl font-extrabold text-text-primary">{item.value}</p>
    <p className="mt-1 text-xs font-medium text-success">{item.change}</p>
  </div>
);

export default StatsCard;
