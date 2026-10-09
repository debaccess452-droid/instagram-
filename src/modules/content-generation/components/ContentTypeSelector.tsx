import React from "react";
import { CONTENT_TYPE_OPTIONS } from "../data/options";

export const ContentTypeSelector: React.FC<{
  selected: string;
  onChange: (id: string) => void;
}> = ({ selected, onChange }) => (
  <div className="space-y-2">
    <p className="text-xs font-semibold text-text-primary">Output Format</p>
    <div className="flex flex-wrap gap-2">
      {CONTENT_TYPE_OPTIONS.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => onChange(item.id)}
          className={`rounded-sm border px-3 py-1.5 text-xs font-medium transition-colors ${
            selected === item.id
              ? "border-primary bg-primary text-white"
              : "border-card-border bg-background text-text-secondary hover:text-text-primary"
          }`}
        >
          {item.label}
        </button>
      ))}
    </div>
  </div>
);

export default ContentTypeSelector;
