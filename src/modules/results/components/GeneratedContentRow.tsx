import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import type { ResultAssetSummary } from "../types/results";
import { CircularScore } from "./CircularScore";

export const GeneratedContentRow: React.FC<{ item: ResultAssetSummary }> = ({ item }) => (
  <Link
    to={item.href}
    className="flex items-center justify-between rounded-lg border border-card-border bg-card p-4 hover:border-primary/50 transition-all"
  >
    <div className="space-y-1">
      <p className="text-sm font-bold text-text-primary">{item.label}</p>
      <p className="text-xs text-text-secondary">{item.description}</p>
    </div>
    <div className="flex items-center gap-3">
      <CircularScore score={item.score} />
      <ArrowRight className="h-4 w-4 text-text-muted" />
    </div>
  </Link>
);

export default GeneratedContentRow;
