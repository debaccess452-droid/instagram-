import React from "react";
import { CheckCircle2 } from "lucide-react";

export const TimelineStep: React.FC<{
  title: string;
  detail: string;
}> = ({ title, detail }) => (
  <div className="flex items-start gap-3 py-2">
    <CheckCircle2 className="h-4 w-4 text-success mt-0.5 shrink-0" />
    <div>
      <p className="text-sm font-semibold text-text-primary">{title}</p>
      <p className="text-xs text-text-secondary">{detail}</p>
    </div>
  </div>
);

export default TimelineStep;
