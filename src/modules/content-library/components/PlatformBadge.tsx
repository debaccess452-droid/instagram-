import React from "react";

export const PlatformBadge: React.FC<{ platform: string }> = ({ platform }) => (
  <span className="inline-flex items-center rounded-sm bg-primary/15 px-2.5 py-0.5 text-xs font-semibold text-primary border border-primary/25">
    {platform}
  </span>
);

export default PlatformBadge;
