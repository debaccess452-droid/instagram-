import React from "react";
import type { ContentItem } from "../types/content";
import { PlatformBadge } from "./PlatformBadge";
import { formatMatchScore } from "../utils/formatters";

export const ContentCard: React.FC<{
  item: ContentItem;
  onSelect?: (item: ContentItem) => void;
}> = ({ item, onSelect }) => (
  <div
    onClick={() => onSelect?.(item)}
    className="cursor-pointer rounded-lg border border-card-border bg-card p-5 shadow-card hover:border-primary/40 transition-all space-y-3"
  >
    <div className="flex items-center justify-between gap-2">
      <PlatformBadge platform={`${item.platform} · ${item.type}`} />
      <span className="text-xs font-semibold text-success">
        {formatMatchScore(item.dnaMatch)}
      </span>
    </div>
    <h3 className="text-base font-bold text-text-primary">{item.title}</h3>
    <p className="text-xs text-text-secondary line-clamp-2">{item.excerpt}</p>
    <div className="flex items-center justify-between pt-2 border-t border-card-border text-xs text-text-muted">
      <span>{item.createdAt}</span>
      {item.views && <span>{item.views} views</span>}
    </div>
  </div>
);

export default ContentCard;
