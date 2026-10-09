import React from "react";

export const HookScoreCard: React.FC = () => (
  <div className="rounded-lg border border-primary/40 bg-card p-5 flex items-center justify-between">
    <div>
      <p className="text-xs text-text-secondary">Top Hook Score</p>
      <p className="text-xl font-extrabold text-text-primary">96 / 100 Retention Match</p>
    </div>
    <span className="rounded-sm bg-success/15 px-3 py-1 text-xs font-semibold text-success">
      High Scroll-Stop Potential
    </span>
  </div>
);

export default HookScoreCard;
