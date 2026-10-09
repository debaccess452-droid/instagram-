import React from "react";

export const EmptyState = ({ title = "No analytics data", description = "" }) => (
  <div className="rounded-lg border border-card-border bg-card p-8 text-center">
    <p className="text-base font-semibold text-text-primary">{title}</p>
    {description && <p className="mt-1 text-xs text-text-secondary">{description}</p>}
  </div>
);

export default EmptyState;
