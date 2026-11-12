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
  HardDrive,
  CheckCircle2,
  Sparkles,
  UploadCloud,
} from "lucide-react";
import { AnalysisHistoryItem } from "../types/analysis";
import { DEMO_PRESET_REELS } from "../data/demoAnalysis";
import { Button } from "@/components/buttons";
import { cn } from "@/utils/cn";

interface AnalysisHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  historyItems: AnalysisHistoryItem[];
  onSelectAnalysis: (id: string) => void;
  onDeleteAnalysis: (id: string, filePath?: string) => void;
}

export const AnalysisHistoryModal: React.FC<AnalysisHistoryModalProps> = ({
  isOpen,
  onClose,
  historyItems,
  onSelectAnalysis,
  onDeleteAnalysis,
}) => {
  const [activeTab, setActiveTab] = useState<"uploads" | "presets">("uploads");
  const [searchQuery, setSearchQuery] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  if (!isOpen) return null;

  const realUploads = historyItems.filter((item) => !item.isDemo);

  const filteredUploads = realUploads.filter(
    (item) =>
      item.videoTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.videoFileName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredPresets = DEMO_PRESET_REELS.filter(
    (preset) =>
      preset.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      preset.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return null;
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

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
                Reel Upload History & Reports
              </h3>
              <p className="text-xs text-text-muted">
                {realUploads.length} verified Supabase uploads
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

        {/* Tab switcher: Separate real uploads from sample demos */}
        <div className="flex items-center gap-2 mt-4 border-b border-card-border/80 pb-2">
          <button
            type="button"
            onClick={() => setActiveTab("uploads")}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5",
              activeTab === "uploads"
                ? "bg-primary text-white shadow-sm"
                : "text-text-secondary hover:text-text-primary hover:bg-white/5"
            )}
          >
            <UploadCloud className="h-3.5 w-3.5" />
            <span>My Reel Uploads</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20">
              {realUploads.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("presets")}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5",
              activeTab === "presets"
                ? "bg-primary text-white shadow-sm"
                : "text-text-secondary hover:text-text-primary hover:bg-white/5"
            )}
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Sample Demos</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20">
              {DEMO_PRESET_REELS.length}
            </span>
          </button>
        </div>

        {/* Search */}
        <div className="my-3 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              activeTab === "uploads"
                ? "Search uploads by filename or title..."
                : "Search sample reels..."
            }
            className="w-full rounded-md border border-card-border bg-background pl-9 pr-3 py-2 text-xs text-text-primary placeholder:text-text-muted focus:border-primary/50 focus:outline-none"
          />
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {activeTab === "uploads" ? (
            filteredUploads.length === 0 ? (
              <div className="py-12 text-center text-text-muted text-xs space-y-2">
                <UploadCloud className="h-8 w-8 text-text-muted mx-auto opacity-50" />
                <p>No uploaded Reels found in your account.</p>
                <p className="text-[11px] text-text-secondary">
                  Upload an Instagram Reel to store it securely in your private Supabase bucket.
                </p>
              </div>
            ) : (
              filteredUploads.map((item) => (
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
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-semibold border",
                            item.status === "uploaded"
                              ? "bg-primary/15 text-primary border-primary/30"
                              : item.status === "completed"
                              ? "bg-success/15 text-success border-success/30"
                              : "bg-warning/15 text-warning border-warning/30"
                          )}
                        >
                          <CheckCircle2 className="h-3 w-3" />
                          {item.status === "uploaded"
                            ? "Uploaded (Ready)"
                            : item.status === "completed"
                            ? "Analyzed"
                            : item.status}
                        </span>
                        {item.fileSizeBytes && (
                          <span className="text-[10px] text-text-muted font-mono">
                            {formatFileSize(item.fileSizeBytes)}
                          </span>
                        )}
                      </div>

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
                        {item.status === "completed" && (
                          <>
                            <span className="flex items-center gap-1 font-mono">
                              <Layers className="h-3 w-3 text-trust" />
                              {item.sceneCount} Scenes
                            </span>
                            <span className="flex items-center gap-1 text-success font-mono">
                              <ShieldCheck className="h-3 w-3" />
                              {item.accuracyScore}%
                            </span>
                          </>
                        )}
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
                            onDeleteAnalysis(item.id, item.filePath);
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
                        title="Delete from database and storage"
                        aria-label="Delete analysis"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}

                    {item.status === "completed" ? (
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
                    ) : (
                      <span className="text-[11px] text-text-muted font-mono px-2 py-1 bg-background-elevated rounded border border-card-border">
                        Stored in DB
                      </span>
                    )}
                  </div>
                </div>
              ))
            )
          ) : (
            filteredPresets.map((preset) => (
              <div
                key={preset.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl border border-card-border bg-card hover:border-primary/40 transition-all group"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded">
                      {preset.category}
                    </span>
                    <span className="text-[10px] font-mono text-text-muted">
                      {preset.duration}
                    </span>
                  </div>
                  <h4 className="text-sm font-semibold text-text-primary group-hover:text-primary transition-colors">
                    {preset.title}
                  </h4>
                  <p className="text-xs text-text-secondary line-clamp-1">
                    {preset.description}
                  </p>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    onSelectAnalysis(preset.id);
                    onClose();
                  }}
                  rightIcon={<ExternalLink className="h-3.5 w-3.5" />}
                  className="shrink-0"
                >
                  View Demo
                </Button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
