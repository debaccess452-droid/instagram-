import React from "react";
import { Search } from "lucide-react";

export const SearchBar: React.FC<{
  value: string;
  onChange: (value: string) => void;
}> = ({ value, onChange }) => (
  <div className="relative w-full sm:w-72">
    <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-text-muted" />
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Search saved scripts & threads..."
      className="w-full rounded-md border border-card-border bg-card pl-9 pr-3 py-2 text-xs text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none"
    />
  </div>
);

export default SearchBar;
