import React from "react";

export const GlassCard = ({ children, className = "" }) => (
  <div
    className={`rounded-lg border border-card-border bg-card/90 p-6 shadow-glass backdrop-blur-md ${className}`}
  >
    {children}
  </div>
);

export default GlassCard;
