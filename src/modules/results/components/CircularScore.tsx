import React from "react";

export const CircularScore: React.FC<{ score?: number }> = ({ score = 95 }) => (
  <div className="inline-flex h-12 w-12 items-center justify-center rounded-full border-2 border-primary bg-primary/15 text-xs font-extrabold text-primary">
    {score}%
  </div>
);

export default CircularScore;
