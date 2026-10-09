import React from "react";
import { hashtagsResult } from "../../data/hashtagsResult";
import { ContentActionRow } from "./ContentActionRow";

export const HashtagCard: React.FC = () => (
  <div className="rounded-lg border border-card-border bg-card p-6 space-y-4">
    <h3 className="text-base font-bold text-text-primary">Curated Discovery Hashtags</h3>
    <div className="flex flex-wrap gap-2">
      {hashtagsResult.map((tag) => (
        <span
          key={tag}
          className="rounded-sm border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary"
        >
          {tag}
        </span>
      ))}
    </div>
    <ContentActionRow text={hashtagsResult.join(" ")} />
  </div>
);

export default HashtagCard;
