import React from "react";

export const RankedList = ({ items = [] }) => (
  <div className="space-y-3">
    {items.map((item, idx) => (
      <div
        key={item.title || idx}
        className="flex items-center justify-between rounded-md border border-card-border bg-background p-3.5"
      >
        <div className="flex items-center gap-3">
          <span className="flex h-6 w-6 items-center justify-center rounded-sm bg-primary/15 text-xs font-bold text-primary">
            #{idx + 1}
          </span>
          <div>
            <p className="text-sm font-semibold text-text-primary">{item.title}</p>
            <p className="text-xs text-text-muted">{item.platform}</p>
          </div>
        </div>
        <span className="text-xs font-bold text-success">{item.metric}</span>
      </div>
    ))}
  </div>
);

export default RankedList;
