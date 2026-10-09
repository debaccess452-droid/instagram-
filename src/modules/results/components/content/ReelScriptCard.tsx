import React from "react";
import { reelScriptResult } from "../../data/reelScriptResult";
import { ContentActionRow } from "./ContentActionRow";

export const ReelScriptCard: React.FC = () => {
  const fullText = `Hook: ${reelScriptResult.hook}\n\nBody: ${reelScriptResult.body}\n\nCTA: ${reelScriptResult.cta}`;
  return (
    <div className="rounded-lg border border-card-border bg-card p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-text-primary">{reelScriptResult.title}</h3>
        <span className="text-xs font-semibold text-success">{reelScriptResult.score}% DNA Match</span>
      </div>
      <div className="space-y-3 text-sm">
        <div>
          <p className="text-xs font-bold uppercase text-primary">0–3s Hook</p>
          <p className="text-text-primary font-semibold">{reelScriptResult.hook}</p>
        </div>
        <div>
          <p className="text-xs font-bold uppercase text-primary">Core Story Beat</p>
          <p className="text-text-secondary leading-relaxed">{reelScriptResult.body}</p>
        </div>
        <div>
          <p className="text-xs font-bold uppercase text-primary">Closing CTA</p>
          <p className="text-text-primary font-medium">{reelScriptResult.cta}</p>
        </div>
      </div>
      <ContentActionRow text={fullText} />
    </div>
  );
};

export default ReelScriptCard;
