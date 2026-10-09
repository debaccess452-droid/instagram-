import React from "react";
import { Badge } from "./Badge";

export const Header: React.FC<{
  title: string;
  subtitle?: string;
}> = ({ title, subtitle }) => (
  <div className="space-y-2">
    <Badge>Creator DNA Studio · 92% Voice Match</Badge>
    <h1 className="text-2xl sm:text-3xl font-bold text-text-primary">{title}</h1>
    {subtitle && <p className="text-sm text-text-secondary">{subtitle}</p>}
  </div>
);

export default Header;
