import React from "react";

export const Badge: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="inline-flex items-center rounded-sm bg-aiPurple/20 px-2.5 py-0.5 text-xs font-semibold text-primary border border-aiPurple/30">
    {children}
  </span>
);

export default Badge;
