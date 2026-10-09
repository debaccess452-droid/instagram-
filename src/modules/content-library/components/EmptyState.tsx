import React from "react";

export const EmptyState: React.FC<{ message?: string }> = ({
  message = "No saved content found matching your filter.",
}) => (
  <div className="rounded-lg border border-card-border bg-card p-8 text-center text-sm text-text-secondary">
    {message}
  </div>
);

export default EmptyState;
