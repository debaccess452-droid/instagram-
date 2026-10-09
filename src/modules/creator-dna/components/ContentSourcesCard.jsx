import React from "react";
import { GlassCard } from "./GlassCard";

export const ContentSourcesCard = ({ sources = [] }) => (
  <GlassCard className="space-y-3">
    <h3 className="text-sm font-bold text-text-primary">Connected Voice Sources</h3>
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {sources.map((s) => (
        <div key={s.type} className="rounded-md border border-card-border bg-background p-3">
          <p className="text-xs font-semibold text-text-primary">{s.type}</p>
          <p className="mt-1 text-xs text-text-secondary">
            {s.count} samples · <span className="text-growthGreen-light">{s.status}</span>
          </p>
        </div>
      ))}
    </div>
  </GlassCard>
);

export default ContentSourcesCard;
