import React from "react";

export const ContentPageHeader: React.FC<{ title: string; subtitle: string }> = ({
  title,
  subtitle,
}) => (
  <div>
    <h1 className="text-2xl font-bold text-text-primary">{title}</h1>
    <p className="text-sm text-text-secondary">{subtitle}</p>
  </div>
);

export default ContentPageHeader;
