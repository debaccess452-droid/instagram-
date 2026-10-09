import React from "react";
import { threadsResult } from "../../data/threadsResult";
import { ContentActionRow } from "./ContentActionRow";

export const ThreadCard: React.FC = () => (
  <div className="rounded-lg border border-card-border bg-card p-6 space-y-4">
    <h3 className="text-base font-bold text-text-primary">Multi-Post Thread Sequence</h3>
    <div className="space-y-3">
      {threadsResult.map((post, idx) => (
        <div key={idx} className="rounded-md border border-card-border bg-background p-4 text-sm text-text-primary">
          {post}
        </div>
      ))}
    </div>
    <ContentActionRow text={threadsResult.join("\n\n")} />
  </div>
);

export default ThreadCard;
