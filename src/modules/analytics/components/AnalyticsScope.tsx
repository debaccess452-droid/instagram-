import React, { type ReactNode } from "react";

export const AnalyticsScope: React.FC<{ children: ReactNode }> = ({ children }) => {
  return <div className="space-y-6 text-text-primary">{children}</div>;
};

export default AnalyticsScope;
