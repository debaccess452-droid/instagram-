import React from "react";
import { GlassCard } from "./GlassCard";

export const BreakdownCards = ({ items = [] }) => (
  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
    {items.map((item) => (
      <GlassCard key={item.label} className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-sm font-bold text-text-primary">{item.label}</p>
          <span className="text-sm font-extrabold text-dnaAiPurple-light">{item.score}%</span>
        </div>
        <p className="text-xs text-text-secondary">{item.summary}</p>
      </GlassCard>
    ))}
  </div>
);

export default BreakdownCards;
