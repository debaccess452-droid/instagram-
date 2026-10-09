import React from "react";

export const StepIndicator = ({ current = 1, total = 3 }) => (
  <div className="text-xs font-semibold text-dnaAiPurple-light">
    Step {current} of {total}
  </div>
);

export default StepIndicator;
