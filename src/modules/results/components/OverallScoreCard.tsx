import React from "react";
import { CircularScore } from "./CircularScore";

export const OverallScoreCard: React.FC = () => (
  <div className="rounded-lg border border-primary/40 bg-card p-6 flex items-center justify-between">
    <div className="space-y-1">
      <span className="text-xs font-semibold uppercase tracking-wider text-primary">
        Creator DNA Verification
      </span>
      <h2 className="text-xl font-bold text-text-primary">
        Campaign Bundle Calibrated & Ready
      </h2>
      <p className="text-xs text-text-secondary">
        All 6 assets below match your personal sentence cadence and hook style.
      </p>
    </div>
    <CircularScore score={96} />
  </div>
);

export default OverallScoreCard;
