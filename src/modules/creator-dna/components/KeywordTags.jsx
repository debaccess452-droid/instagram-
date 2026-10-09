import React from "react";
import { GlassCard } from "./GlassCard";

export const KeywordTags = ({ keywords = [] }) => (
  <GlassCard className="space-y-3">
    <h3 className="text-sm font-bold text-text-primary">Signature Vocabulary & Phrases</h3>
    <div className="flex flex-wrap gap-2">
      {keywords.map((kw) => (
        <span
          key={kw}
          className="rounded-sm border border-dnaAiPurple/30 bg-dnaAiPurple/10 px-3 py-1 text-xs font-medium text-text-primary"
        >
          {kw}
        </span>
      ))}
    </div>
  </GlassCard>
);

export default KeywordTags;
