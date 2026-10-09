import React from "react";
import { Card } from "../Card";
import { Timeline } from "./Timeline";

export const ProgressCard: React.FC = () => (
  <Card className="space-y-4">
    <div className="flex items-center justify-between text-xs font-semibold">
      <span className="text-text-primary">Generation Pipeline</span>
      <span className="text-success">100% Complete</span>
    </div>
    <Timeline />
  </Card>
);

export default ProgressCard;
