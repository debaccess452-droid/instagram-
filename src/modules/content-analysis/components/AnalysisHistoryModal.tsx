import React, { useState } from "react";
import {
  History,
  X,
  Search,
  Trash2,
  ExternalLink,
  Clock,
  Layers,
  ShieldCheck,
  AlertTriangle,
} from "lucide-react";
import { AnalysisHistoryItem } from "../types/analysis";
import { Button } from "@/components/buttons";
import { cn } from "@/utils/cn";

interface AnalysisHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  historyItems: AnalysisHistoryItem[];
  onSelectAnalysis: (id: string) => void;
  onDeleteAnalysis: (id: string) => void;
}

export const AnalysisHistoryModal: React.FC<AnalysisHistoryModalProps> = ({
  isOpen,
  onClose,
  historyItems,
  onSelectAnalysis,
  onDeleteAnalysis,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  if (!isOpen) return null;

  const filteredItems = historyItems.filter((item) =>
    item.videoTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.videoFileName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-auth-fade-in">
      <div className="relative w-full max-w-2xl rounded-2xl border border-card-border bg-gradient-to-b from-card to-background-elevated p-6 shadow-card-lg overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-card-border pb-4">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-lg bg-primary/15 text-primary border border-primary/25">
              <History className="h-4 w-4" />
            </span>
            <div>
              <h3 className="text-base font-bold text-text-primary">
                Analysis History & Saved Reports
              </h3>
              <p className="text-xs text-text-muted">
                {historyItems.length} indexed Reels with stored multimodal breakdowns
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-md text-text-secondary hover:text-text-primary hover:bg-white/5 transition-colors"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Search */}
        <div className="my-4 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search saved analyses by Reel title or filename..."
            className="w-full rounded-md border border-card-border bg-background pl-9 pr-3 py-2 text-xs text-text-primary placeholder:text-text-muted focus:border-primary/50 focus:outline-none"
          />
        </div>

        {/* List of Saved Analyses */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {filteredItems.length === 0 ? (
            <div className="py-12 text-center text-text-muted text-xs">
              No saved analyses found matching your search.
            </div>
          ) : (
            filteredItems.map((item) => (
              <div
                key={item.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl border border-card-border bg-card hover:border-primary/40 transition-all group"
              >
                <div className="flex items-start gap-3">
                  <img
                    src={item.thumbnailUrl}
                    alt={item.videoTitle}
                    className="h-16 w-12 rounded-lg object-cover border border-card-border shrink-0"
                  />

                  <div className="space-y-1">
                    <h4 className="text-sm font-semibold text-text-primary group-hover:text-primary transition-colors line-clamp-1">
                      {item.videoTitle}
                    </h4>
                    <p className="text-xs text-text-muted font-mono truncate max-w-xs">
                      {item.videoFileName}
                    </p>

                    <div className="flex items-center gap-3 text-[11px] text-text-muted pt-0.5">
                      <span className="flex items-center gap-1 font-mono">
                        <Clock className="h-3 w-3 text-primary" />
                        {item.durationFormatted}
                      </span>
                      <span className="flex items-center gap-1 font-mono">
                        <Layers className="h-3 w-3 text-trust" />
                        {item.sceneCount} Scenes
                      </span>
                      <span className="flex items-center gap-1 text-success font-mono">
                        <ShieldCheck className="h-3 w-3" />
                        {item.accuracyScore}%
                      </span>
                      <span>• {item.uploadedAt}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  {confirmDeleteId === item.id ? (
                    <div className="flex items-center gap-1.5 bg-error/10 border border-error/25 p-1 rounded-md">
                      <span className="text-[10px] text-error px-1">Delete?</span>
                      <button
                        type="button"
                        onClick={() => {
                          onDeleteAnalysis(item.id);
                          setConfirmDeleteId(null);
                        }}
                        className="px-2 py-0.5 text-[10px] font-bold text-white bg-error rounded hover:bg-error/80"
                      >
                        Yes
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteId(null)}
                        className="px-2 py-0.5 text-[10px] text-text-secondary hover:text-text-primary"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteId(item.id)}
                      className="p-1.5 rounded-md text-text-muted hover:text-error hover:bg-error/10 transition-colors"
                      title="Delete analysis"
                      aria-label="Delete analysis"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}

                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      onSelectAnalysis(item.id);
                      onClose();
                    }}
                    rightIcon={<ExternalLink className="h-3.5 w-3.5" />}
                  >
                    Open Report
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
