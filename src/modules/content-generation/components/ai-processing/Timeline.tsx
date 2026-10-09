import React from "react";
import { aiProcessingSteps } from "../../data/aiProcessingMock";
import { TimelineStep } from "./TimelineStep";

export const Timeline: React.FC = () => (
  <div className="divide-y divide-card-border">
    {aiProcessingSteps.map((s) => (
      <TimelineStep key={s.id} title={s.title} detail={s.detail} />
    ))}
  </div>
);

export default Timeline;
