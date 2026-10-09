import React from "react";
import { GlassCard } from "./GlassCard";

export const ImportCard = ({ title = "Import Content", description = "" }) => (
  <GlassCard>
    <p className="text-sm font-bold text-text-primary">{title}</p>
    {description && <p className="mt-1 text-xs text-text-secondary">{description}</p>}
  </GlassCard>
);

export default ImportCard;
