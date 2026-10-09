import React from "react";

export const ProgressRing = ({ value = 85, label = "Score" }) => {
  return (
    <div className="inline-flex flex-col items-center justify-center p-4">
      <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-primary bg-primary/10">
        <span className="text-2xl font-extrabold text-text-primary">{value}%</span>
      </div>
      <span className="mt-2 text-xs text-text-secondary">{label}</span>
    </div>
  );
};

export default ProgressRing;
