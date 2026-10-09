import React from "react";
import { Heatmap } from "../charts/Heatmap";
import { mockPostingTime } from "../data/mockPostingTime";

export const BestPostingTime = () => (
  <div className="rounded-lg border border-card-border bg-card p-6 space-y-6">
    <div>
      <h3 className="text-base font-bold text-text-primary">Optimal Posting Windows</h3>
      <p className="text-xs text-text-secondary">
        Based on your followers' active scroll sessions and 3-second hook retention
      </p>
    </div>
    <Heatmap slots={mockPostingTime.slots} />
    <div className="space-y-2 pt-2 border-t border-card-border">
      {mockPostingTime.bestWindows.map((w) => (
        <div key={w} className="text-xs font-medium text-text-primary">
          • {w}
        </div>
      ))}
    </div>
  </div>
);

export default BestPostingTime;
