import React from "react";
import { PLATFORM_OPTIONS } from "../data/options";

export const PlatformSelector: React.FC<{
  selected: string;
  onChange: (id: string) => void;
}> = ({ selected, onChange }) => (
  <div className="space-y-2">
    <p className="text-xs font-semibold text-text-primary">Target Platform</p>
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {PLATFORM_OPTIONS.map((p) => (
        <button
          key={p.id}
          type="button"
          onClick={() => onChange(p.id)}
          className={`rounded-md border p-3 text-left transition-all ${
            selected === p.id
              ? "border-primary bg-primary/15 text-text-primary"
              : "border-card-border bg-background text-text-secondary hover:border-primary/40"
          }`}
        >
          <p className="text-xs font-bold text-text-primary">{p.label}</p>
          <p className="mt-0.5 text-[11px] text-text-muted">{p.description}</p>
        </button>
      ))}
    </div>
  </div>
);

export default PlatformSelector;
