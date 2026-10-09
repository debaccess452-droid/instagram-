import React from "react";

export const FilterBar: React.FC<{
  selected: string;
  onSelect: (platform: string) => void;
}> = ({ selected, onSelect }) => {
  const platforms = ["All", "Instagram", "X", "LinkedIn"];
  return (
    <div className="flex flex-wrap gap-2">
      {platforms.map((p) => (
        <button
          key={p}
          type="button"
          onClick={() => onSelect(p)}
          className={`rounded-sm px-3 py-1.5 text-xs font-semibold transition-colors ${
            selected === p
              ? "bg-primary text-white"
              : "bg-card text-text-secondary hover:text-text-primary border border-card-border"
          }`}
        >
          {p}
        </button>
      ))}
    </div>
  );
};

export default FilterBar;
