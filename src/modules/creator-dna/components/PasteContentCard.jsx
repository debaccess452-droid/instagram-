import React, { useState } from "react";
import { GlassCard } from "./GlassCard";
import { PrimaryDNAButton } from "./Buttons";

export const PasteContentCard = ({ onSave }) => {
  const [sample, setSample] = useState("");
  return (
    <GlassCard className="space-y-3">
      <h3 className="text-sm font-bold text-text-primary">Add Writing Sample to DNA</h3>
      <textarea
        rows={3}
        value={sample}
        onChange={(e) => setSample(e.target.value)}
        placeholder="Paste a high-performing Instagram caption or X thread to refine your voice model..."
        className="w-full rounded-md border border-card-border bg-background p-3 text-xs text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none"
      />
      <PrimaryDNAButton
        onClick={() => {
          if (sample.trim() && onSave) {
            onSave(sample);
            setSample("");
          }
        }}
      >
        Recalibrate Creator DNA
      </PrimaryDNAButton>
    </GlassCard>
  );
};

export default PasteContentCard;
