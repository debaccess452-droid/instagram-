import React from "react";

export const ProgressStep = ({ label, done = true }) => (
  <div className="flex items-center justify-between text-xs py-1">
    <span className="text-text-primary">{label}</span>
    <span className={done ? "text-growthGreen-light font-semibold" : "text-text-muted"}>
      {done ? "Complete" : "Pending"}
    </span>
  </div>
);

export default ProgressStep;
