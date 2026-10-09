import React from "react";
import { GlassCard } from "./GlassCard";
import { ScoreRing } from "./ScoreRing";

export const CreatorDNACard = ({ dna }) => (
  <GlassCard className="flex flex-col sm:flex-row items-center justify-between gap-6">
    <div className="space-y-2">
      <span className="inline-flex items-center rounded-sm bg-dnaAiPurple/20 px-2.5 py-0.5 text-xs font-semibold text-dnaAiPurple-light">
        {dna.status} · Updated {dna.lastUpdated}
      </span>
      <h2 className="text-2xl font-bold text-text-primary">
        Creator DNA Fingerprint ({dna.handle})
      </h2>
      <p className="text-sm text-text-secondary">
        Primary Niche: <span className="text-text-primary font-medium">{dna.niche}</span>
      </p>
    </div>
    <ScoreRing score={dna.overallScore} />
  </GlassCard>
);

export default CreatorDNACard;
