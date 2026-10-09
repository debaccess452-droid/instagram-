import React from "react";

export const StepIndicator: React.FC<{ step?: number }> = ({ step = 1 }) => (
  <div className="text-xs font-semibold text-primary">Step {step} of 2 · Configure Campaign</div>
);

export default StepIndicator;
