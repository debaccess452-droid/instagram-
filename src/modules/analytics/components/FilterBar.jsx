import React from "react";

export const FilterBar = ({ activeRange = "30d", onRangeChange = () => {} }) => {
  const ranges = ["7d", "30d", "90d"];
  return (
    <div className="inline-flex items-center gap-1 rounded-md border border-card-border bg-card p-1">
      {ranges.map((r) => (
        <button
          key={r}
          type="button"
          onClick={() => onRangeChange(r)}
          className={`rounded-sm px-3 py-1 text-xs font-semibold transition-colors ${
            activeRange === r
              ? "bg-primary text-white"
              : "text-text-secondary hover:text-text-primary"
          }`}
        >
          {r.toUpperCase()}
        </button>
      ))}
    </div>
  );
};

export default FilterBar;
