import React from "react";
import { ctaResult } from "../../data/ctaResult";
import { ContentActionRow } from "./ContentActionRow";

export const CtaCard: React.FC = () => (
  <div className="space-y-4">
    {ctaResult.map((c) => (
      <div key={c.type} className="rounded-lg border border-card-border bg-card p-6 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-primary">{c.type}</span>
          <span className="text-xs font-semibold text-success">{c.score}% Conversion Match</span>
        </div>
        <p className="text-sm font-semibold text-text-primary">"{c.text}"</p>
        <ContentActionRow text={c.text} />
      </div>
    ))}
  </div>
);

export default CtaCard;
