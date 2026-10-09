import React from "react";
import { captionResult } from "../../data/captionResult";
import { ContentActionRow } from "./ContentActionRow";

export const CaptionCard: React.FC = () => (
  <div className="rounded-lg border border-card-border bg-card p-6 space-y-4">
    <div className="flex items-center justify-between">
      <h3 className="text-base font-bold text-text-primary">{captionResult.title}</h3>
      <span className="text-xs font-semibold text-success">{captionResult.score}% DNA Match</span>
    </div>
    <p className="whitespace-pre-line text-sm text-text-primary leading-relaxed">
      {captionResult.text}
    </p>
    <ContentActionRow text={captionResult.text} />
  </div>
);

export default CaptionCard;
