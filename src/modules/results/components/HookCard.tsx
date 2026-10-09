import React, { useState } from "react";
import { Copy, Check } from "lucide-react";
import type { HookItem } from "../types/hooks";
import { CircularScore } from "./CircularScore";

export const HookCard: React.FC<{ item: HookItem }> = ({ item }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard?.writeText(item.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="flex items-start justify-between gap-4 rounded-lg border border-card-border bg-card p-5">
      <div className="space-y-2">
        <span className="inline-flex rounded-sm bg-primary/15 px-2.5 py-0.5 text-xs font-semibold text-primary">
          {item.category}
        </span>
        <p className="text-base font-bold text-text-primary leading-relaxed">
          "{item.text}"
        </p>
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-text-secondary hover:text-text-primary"
        >
          {copied ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
          <span>{copied ? "Copied" : "Copy Hook"}</span>
        </button>
      </div>
      <CircularScore score={item.score} />
    </div>
  );
};

export default HookCard;
