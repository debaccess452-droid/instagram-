import React from "react";
import { GlassCard } from "./GlassCard";
import { ProgressStep } from "./ProgressStep";

export const ProgressCard = () => (
  <GlassCard className="space-y-2">
    <h3 className="text-sm font-bold text-text-primary">DNA Calibration Pipeline</h3>
    <ProgressStep label="Hook Pattern Extraction" done />
    <ProgressStep label="Sentence Cadence Mapping" done />
    <ProgressStep label="Vocabulary Fingerprint" done />
  </GlassCard>
);

export default ProgressCard;
