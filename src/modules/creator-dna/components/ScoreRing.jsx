import React from "react";

export const ScoreRing = ({ score = 92 }) => (
  <div className="flex h-28 w-28 flex-col items-center justify-center rounded-full border-4 border-dnaAiPurple bg-dnaAiPurple/10 shadow-glow">
    <span className="text-3xl font-extrabold text-text-primary">{score}%</span>
    <span className="text-[11px] font-medium text-dnaAiPurple-light">DNA Match</span>
  </div>
);

export default ScoreRing;
