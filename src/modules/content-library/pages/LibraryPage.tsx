import React, { useState } from "react";
import { useContent } from "../hooks/useContent";
import { ContentCard } from "../components/ContentCard";
import { FilterBar } from "../components/FilterBar";
import { SearchBar } from "../components/SearchBar";
import { EmptyState } from "../components/EmptyState";
import { ViewContentModal } from "../components/ViewContentModal";
import type { ContentItem } from "../types/content";

export const LibraryPage: React.FC = () => {
  const { items } = useContent();
  const [platform, setPlatform] = useState("All");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<ContentItem | null>(null);

  const filtered = items.filter((item) => {
    const matchesPlatform = platform === "All" || item.platform === platform;
    const matchesQuery =
      !query.trim() ||
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.excerpt.toLowerCase().includes(query.toLowerCase());
    return matchesPlatform && matchesQuery;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Content Library & History</h1>
        <p className="text-sm text-text-secondary">
          Browse, search, and reuse all scripts, threads, and captions generated with your Creator DNA.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <FilterBar selected={platform} onSelect={setPlatform} />
        <SearchBar value={query} onChange={setQuery} />
      </div>

      {filtered.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((item) => (
            <ContentCard key={item.id} item={item} onSelect={setSelected} />
          ))}
        </div>
      )}

      <ViewContentModal item={selected} onClose={() => setSelected(null)} />
    </div>
  );
};

export default LibraryPage;
