import React from "react";

export const SectionHeader = ({ title, subtitle, right }) => (
  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
    <div>
      <h2 className="text-xl font-bold text-text-primary">{title}</h2>
      {subtitle && <p className="text-xs sm:text-sm text-text-secondary">{subtitle}</p>}
    </div>
    {right && <div>{right}</div>}
  </div>
);

export default SectionHeader;
