import React, { useState } from "react";
import {
  FileSpreadsheet,
  Copy,
  Check,
  Download,
  Play,
  Search,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Sparkles,
  RotateCcw,
  Info,
  Volume2,
  Camera,
  Type,
  Clock,
  ShieldAlert,
  ArrowRight,
} from "lucide-react";
import {
  ScriptTableRow,
  OriginalScriptBackendResult,
  OriginalScriptBackendRow,
  OriginalScriptStatus,
  OriginalScriptSourceStatuses,
  AnalysisTabType,
} from "../types/analysis";
import { contentAnalysisService } from "../services/contentAnalysisService";
import { Button } from "@/components/buttons";
import { cn } from "@/utils/cn";

export interface SourceMetadataItem {
  provider?: string | null;
  model?: string | null;
  source?: string | null;
  warnings?: string[];
}

export interface OriginalScriptTableProps {
  scriptTable?: ScriptTableRow[];
  videoTitle: string;
  onSeek: (seconds: number) => void;
  onOpenExport?: () => void;
  isDemoData?: boolean;
  isRealMode?: boolean;
  realData?: OriginalScriptBackendResult | null;
  status?: OriginalScriptStatus | null;
  errorMessage?: string | null;
  errorCode?: string | null;
  sourceStatuses?: OriginalScriptSourceStatuses;
  incompleteSourcesError?: OriginalScriptSourceStatuses | null;
  sourceMetadata?: {
    audio?: SourceMetadataItem | null;
    visual?: SourceMetadataItem | null;
    text?: SourceMetadataItem | null;
  };
  onGenerateScript?: () => void;
  onRetry?: () => void;
  isProcessing?: boolean;
  onSelectTab?: (tab: AnalysisTabType) => void;
}

function normalizeStatus(status?: string | null): string {
  return String(status || "").trim().toLowerCase();
}

function formatSourceStatusLabel(status?: string | null): string {
  const s = normalizeStatus(status);
  if (!s || s === "pending") return "Pending";
  if (s === "completed") return "Completed";
  if (s === "processing") return "Processing";
  if (s === "queued") return "Queued";
  if (s === "failed") return "Failed";
  if (s.includes("groq") || s.includes("fallback")) return "Processing (Fallback)";
  return String(status);
}

function formatCsvCell(value: string): string {
  return `"${value.replace(/"/g, '""')}"`;
}

function formatMarkdownCell(value: string): string {
  return value.replace(/\|/g, "\\|").replace(/\r?\n/g, " ");
}

export const OriginalScriptTable: React.FC<OriginalScriptTableProps> = ({
  scriptTable = [],
  videoTitle,
  onSeek,
  isDemoData = false,
  isRealMode = false,
  realData,
  status,
  errorMessage,
  errorCode,
  sourceStatuses,
  incompleteSourcesError,
  sourceMetadata,
  onGenerateScript,
  onRetry,
  isProcessing = false,
  onSelectTab,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedTable, setCopiedTable] = useState(false);
  const [copiedRowId, setCopiedRowId] = useState<string | null>(null);

  const handleCopyRow = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedRowId(id);
    setTimeout(() => setCopiedRowId(null), 1800);
  };

  // =========================================================================
  // REAL BACKEND MODE (generate-original-script Edge Function)
  // =========================================================================
  if (isRealMode) {
    const normalizedStatus = normalizeStatus(status);
    const isCompletedStatus = normalizedStatus === "completed";
    const isFailedStatus = normalizedStatus === "failed";
    const isBackendActiveStatus =
      normalizedStatus === "processing" || normalizedStatus === "queued";

    const resolveSourceStatus = (live?: string | null, errStatus?: string | null) => {
      if (normalizeStatus(live) === "completed") return live ?? null;
      return errStatus ?? live ?? null;
    };

    const effectiveSourceStatuses: OriginalScriptSourceStatuses = {
      audio: resolveSourceStatus(sourceStatuses?.audio, incompleteSourcesError?.audio),
      visual: resolveSourceStatus(sourceStatuses?.visual, incompleteSourcesError?.visual),
      text: resolveSourceStatus(sourceStatuses?.text, incompleteSourcesError?.text),
    };

    const sourceList: Array<{
      key: "audio" | "visual" | "text";
      label: string;
      status: string | null | undefined;
      normalized: string;
      completed: boolean;
      icon: React.ComponentType<{ className?: string }>;
    }> = [
      {
        key: "audio",
        label: "Audio Analysis",
        status: effectiveSourceStatuses.audio,
        normalized: normalizeStatus(effectiveSourceStatuses.audio),
        completed: normalizeStatus(effectiveSourceStatuses.audio) === "completed",
        icon: Volume2,
      },
      {
        key: "visual",
        label: "Visual Analysis",
        status: effectiveSourceStatuses.visual,
        normalized: normalizeStatus(effectiveSourceStatuses.visual),
        completed: normalizeStatus(effectiveSourceStatuses.visual) === "completed",
        icon: Camera,
      },
      {
        key: "text",
        label: "Text Extraction",
        status: effectiveSourceStatuses.text,
        normalized: normalizeStatus(effectiveSourceStatuses.text),
        completed: normalizeStatus(effectiveSourceStatuses.text) === "completed",
        icon: Type,
      },
    ];

    const incompleteSources = sourceList.filter((s) => !s.completed);
    const allSourcesCompleted = incompleteSources.length === 0;
    const isIncompleteSourceFailure =
      errorCode === "SOURCE_ANALYSES_INCOMPLETE" ||
      Boolean(incompleteSourcesError) ||
      (typeof errorMessage === "string" &&
        errorMessage.includes("SOURCE_ANALYSES_INCOMPLETE"));

    const shouldRenderCompletedRealData = Boolean(realData) && isCompletedStatus;

    // 1. Processing State
    if (
      !shouldRenderCompletedRealData &&
      (isProcessing || (isBackendActiveStatus && !isFailedStatus))
    ) {
      return (
        <div className="rounded-2xl border border-primary/30 bg-card p-8 sm:p-12 shadow-card text-center space-y-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 text-primary mx-auto">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
          <div className="max-w-md mx-auto space-y-2">
            <h3 className="text-lg font-bold text-text-primary">
              Generating Original Reel Script...
            </h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              Synchronizing recorded evidence from Audio Analysis, Visual Analysis,
              and On-Screen Text Extraction into a chronological script table.
            </p>
            <div className="pt-2 text-[11px] font-mono text-text-muted flex items-center justify-center gap-2">
              <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              <span>Processing in background • Checking status every 5 seconds</span>
            </div>
          </div>
        </div>
      );
    }

    // 2. Failed State (or SOURCE_ANALYSES_INCOMPLETE backend response)
    if (
      !shouldRenderCompletedRealData &&
      (isFailedStatus || isIncompleteSourceFailure || (!realData && Boolean(errorMessage)))
    ) {
      return (
        <div className="rounded-2xl border border-error/30 bg-card p-6 sm:p-8 shadow-card space-y-5">
          <div className="flex items-start gap-3.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-error/15 text-error shrink-0 border border-error/25">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div className="space-y-1 flex-1">
              <h3 className="text-base font-bold text-text-primary">
                {isIncompleteSourceFailure
                  ? "Source Analyses Incomplete"
                  : "Original Reel Script Generation Failed"}
              </h3>
              <p className="text-xs text-error leading-relaxed">
                {isIncompleteSourceFailure
                  ? "All three source analyses must be completed before the Original Reel Script can be generated."
                  : errorMessage ||
                    "The backend encountered an error while generating the Original Reel Script."}
              </p>
              {!isIncompleteSourceFailure && (
                <p className="text-[11px] text-text-muted mt-1">
                  Your uploaded Reel and completed source analyses remain saved. You can retry generation without re-uploading.
                </p>
              )}
            </div>
          </div>

          {isIncompleteSourceFailure && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              {sourceList.map((src) => {
                const Icon = src.icon;
                return (
                  <div
                    key={src.key}
                    className={cn(
                      "rounded-xl border p-3.5 flex flex-col justify-between gap-2.5",
                      src.completed
                        ? "border-success/30 bg-success/5"
                        : "border-warning/35 bg-warning/5"
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 text-xs font-semibold text-text-primary">
                        <Icon
                          className={cn(
                            "h-4 w-4",
                            src.completed ? "text-success" : "text-warning"
                          )}
                        />
                        <span>{src.label}</span>
                      </div>
                      <span
                        className={cn(
                          "rounded px-2 py-0.5 text-[10px] font-mono font-semibold border",
                          src.completed
                            ? "bg-success/15 text-success border-success/30"
                            : "bg-warning/15 text-warning border-warning/30"
                        )}
                      >
                        {formatSourceStatusLabel(src.status)}
                      </span>
                    </div>
                    {!src.completed && onSelectTab && (
                      <button
                        type="button"
                        onClick={() => onSelectTab(src.key)}
                        className="inline-flex items-center gap-1 text-[11px] font-medium text-primary hover:underline self-start cursor-pointer"
                      >
                        <span>Go to {src.label}</span>
                        <ArrowRight className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {onRetry && (
            <div className="flex items-center justify-between gap-3 pt-2 border-t border-card-border/80 flex-wrap">
              {!allSourcesCompleted && (
                <span className="text-[11px] text-warning">
                  Incomplete: {incompleteSources.map((s) => s.label).join(", ")}
                </span>
              )}
              <div className="ml-auto">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={onRetry}
                  disabled={isProcessing || !allSourcesCompleted}
                  leftIcon={<RotateCcw className="h-4 w-4" />}
                >
                  Retry Script Generation
                </Button>
              </div>
            </div>
          )}
        </div>
      );
    }

    // 3. Pending / Not Generated State (manual button only, gated by 3 completed sources)
    if (!realData && (normalizedStatus === "pending" || !normalizedStatus)) {
      return (
        <div className="rounded-2xl border border-card-border bg-card p-6 sm:p-10 shadow-card space-y-6">
          <div className="text-center space-y-3">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 text-primary mx-auto">
              <FileSpreadsheet className="h-8 w-8" />
            </div>
            <div className="max-w-lg mx-auto space-y-2">
              <h3 className="text-lg font-bold text-text-primary">
                Original Reel Script
              </h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                Reconstruct a chronological, timestamped production script by synchronizing
                your completed Audio Analysis, Visual Analysis, and On-Screen Text Extraction results.
              </p>
            </div>
          </div>

          {/* Source Analyses Readiness Checklist */}
          <div className="max-w-2xl mx-auto space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {sourceList.map((src) => {
                const Icon = src.icon;
                return (
                  <div
                    key={src.key}
                    className={cn(
                      "rounded-xl border p-3.5 flex flex-col justify-between gap-2.5 transition-colors",
                      src.completed
                        ? "border-success/30 bg-success/5"
                        : "border-card-border bg-background-elevated/60"
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 text-xs font-semibold text-text-primary">
                        <Icon
                          className={cn(
                            "h-4 w-4",
                            src.completed ? "text-success" : "text-text-muted"
                          )}
                        />
                        <span>{src.label}</span>
                      </div>
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-mono font-semibold border",
                          src.completed
                            ? "bg-success/15 text-success border-success/30"
                            : src.normalized === "failed"
                            ? "bg-error/15 text-error border-error/30"
                            : src.normalized === "processing" || src.normalized === "queued"
                            ? "bg-amber-500/15 text-amber-400 border-amber-500/30"
                            : "bg-background text-text-muted border-card-border"
                        )}
                      >
                        {src.completed && <CheckCircle2 className="h-3 w-3" />}
                        {formatSourceStatusLabel(src.status)}
                      </span>
                    </div>

                    {!src.completed && onSelectTab && (
                      <button
                        type="button"
                        onClick={() => onSelectTab(src.key)}
                        className="inline-flex items-center gap-1 text-[11px] font-medium text-primary hover:underline self-start cursor-pointer"
                      >
                        <span>Complete {src.label}</span>
                        <ArrowRight className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {!allSourcesCompleted && (
              <div className="rounded-xl border border-warning/30 bg-warning/5 px-4 py-3 text-xs text-text-secondary flex items-start gap-2.5">
                <AlertTriangle className="h-4 w-4 text-warning shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-text-primary">
                    Waiting on incomplete source{" "}
                    {incompleteSources.length === 1 ? "analysis" : "analyses"}:{" "}
                  </span>
                  <span>
                    {incompleteSources.map((s) => s.label).join(", ")}.
                  </span>{" "}
                  <span>
                    All three source analyses must be completed before generating the Original Reel Script.
                  </span>
                </div>
              </div>
            )}
          </div>

          {onGenerateScript && (
            <div className="text-center pt-1">
              <Button
                variant="primary"
                size="lg"
                onClick={onGenerateScript}
                disabled={isProcessing || !allSourcesCompleted}
                leftIcon={<Sparkles className="h-5 w-5" />}
                className="shadow-glow-primary py-3 px-6 cursor-pointer"
              >
                {isProcessing ? "Starting..." : "Generate Original Script"}
              </Button>
            </div>
          )}
        </div>
      );
    }

    // 4. Completed status with missing payload edge case
    if (isCompletedStatus && !realData) {
      return (
        <div className="rounded-2xl border border-card-border bg-card p-6 sm:p-8 shadow-card space-y-3">
          <div className="flex items-start gap-3.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-warning/15 text-warning shrink-0 border border-warning/25">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div className="space-y-1 flex-1">
              <h3 className="text-base font-bold text-text-primary">
                Original Reel Script Unavailable
              </h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                This analysis record is marked as completed, but no original script payload was saved.
              </p>
            </div>
          </div>
        </div>
      );
    }

    // 5. Completed + Saved Real Backend Script Result
    if (realData) {
      const rawRows: OriginalScriptBackendRow[] = Array.isArray(realData.rows)
        ? realData.rows
        : [];

      const sortedRows = rawRows
        .map((row, originalIndex) => ({ row, originalIndex }))
        .sort((a, b) => {
          const aStart =
            typeof a.row.time_start_seconds === "number" &&
            Number.isFinite(a.row.time_start_seconds)
              ? a.row.time_start_seconds
              : Number.MAX_SAFE_INTEGER;
          const bStart =
            typeof b.row.time_start_seconds === "number" &&
            Number.isFinite(b.row.time_start_seconds)
              ? b.row.time_start_seconds
              : Number.MAX_SAFE_INTEGER;
          if (aStart !== bStart) return aStart - bStart;
          return a.originalIndex - b.originalIndex;
        })
        .map((entry) => entry.row);

      const filteredRealRows = sortedRows.filter((row) => {
        const q = searchQuery.toLowerCase().trim();
        if (!q) return true;
        return (
          (row.time && row.time.toLowerCase().includes(q)) ||
          (row.original_voiceover_audio &&
            row.original_voiceover_audio.toLowerCase().includes(q)) ||
          (row.exact_on_screen_text &&
            row.exact_on_screen_text.toLowerCase().includes(q)) ||
          (row.detailed_visual_direction &&
            row.detailed_visual_direction.toLowerCase().includes(q))
        );
      });

      const handleCopyRealTable = () => {
        let md =
          "| Time | Original Voiceover / Audio | Exact On-Screen Text | Detailed Visual Direction |\n";
        md += "|---|---|---|---|\n";
        sortedRows.forEach((r) => {
          const timeStr = formatMarkdownCell(r.time || "—");
          const voStr = formatMarkdownCell(r.original_voiceover_audio?.trim() || "—");
          const txtStr = formatMarkdownCell(r.exact_on_screen_text?.trim() || "—");
          const visStr = formatMarkdownCell(r.detailed_visual_direction?.trim() || "—");
          md += `| ${timeStr} | ${voStr} | ${txtStr} | ${visStr} |\n`;
        });
        navigator.clipboard.writeText(md);
        setCopiedTable(true);
        setTimeout(() => setCopiedTable(false), 2000);
      };

      const handleExportRealCSV = () => {
        const headers = [
          "Time",
          "Original Voiceover / Audio",
          "Exact On-Screen Text",
          "Detailed Visual Direction",
        ];
        const rows = sortedRows.map((r) => [
          formatCsvCell(r.time || ""),
          formatCsvCell(r.original_voiceover_audio?.trim() || ""),
          formatCsvCell(r.exact_on_screen_text?.trim() || ""),
          formatCsvCell(r.detailed_visual_direction?.trim() || ""),
        ]);
        const csvContent =
          "data:text/csv;charset=utf-8," +
          [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        const sanitizedTitle = (videoTitle || "reel")
          .toLowerCase()
          .replace(/[^a-z0-9]/g, "_");
        link.setAttribute("download", `${sanitizedTitle}_original_reel_script.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      };

      const meta = realData.analysis_metadata || {};
      const audioProvider =
        meta.sources?.audio?.provider ||
        meta.source_models?.audio?.provider ||
        meta.audio_provider ||
        sourceMetadata?.audio?.provider ||
        sourceMetadata?.audio?.source ||
        null;
      const audioModel =
        meta.sources?.audio?.model ||
        meta.source_models?.audio?.model ||
        meta.audio_model ||
        sourceMetadata?.audio?.model ||
        null;

      const visualProvider =
        meta.sources?.visual?.provider ||
        meta.source_models?.visual?.provider ||
        meta.visual_provider ||
        sourceMetadata?.visual?.provider ||
        sourceMetadata?.visual?.source ||
        null;
      const visualModel =
        meta.sources?.visual?.model ||
        meta.source_models?.visual?.model ||
        meta.visual_model ||
        sourceMetadata?.visual?.model ||
        null;

      const textProvider =
        meta.sources?.text_extraction?.provider ||
        meta.sources?.text?.provider ||
        meta.source_models?.text_extraction?.provider ||
        meta.source_models?.text?.provider ||
        meta.text_extraction_provider ||
        meta.text_provider ||
        sourceMetadata?.text?.provider ||
        sourceMetadata?.text?.source ||
        null;
      const textModel =
        meta.sources?.text_extraction?.model ||
        meta.sources?.text?.model ||
        meta.source_models?.text_extraction?.model ||
        meta.source_models?.text?.model ||
        meta.text_extraction_model ||
        meta.text_model ||
        sourceMetadata?.text?.model ||
        null;

      const syncMethod =
        meta.synchronization_method || meta.sync_method || meta.method || null;

      const rawNotes = meta.analysis_notes ?? meta.notes ?? null;
      const analysisNotesList = Array.isArray(rawNotes)
        ? rawNotes.filter((n) => typeof n === "string" && n.trim().length > 0)
        : typeof rawNotes === "string" && rawNotes.trim().length > 0
        ? [rawNotes.trim()]
        : [];

      const warnings = Array.isArray(meta.warnings)
        ? meta.warnings.filter((w) => typeof w === "string" && w.trim().length > 0)
        : [];

      return (
        <div className="space-y-6">
          {/* Header & Master Blueprint Toolbar */}
          <div className="rounded-xl border border-primary/25 bg-gradient-to-r from-card via-background-elevated to-card p-5 shadow-card space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-card-border/70 pb-3.5">
              <div className="flex items-center gap-2.5">
                <span className="p-2.5 rounded-lg bg-primary/20 text-primary border border-primary/30 shadow-glow-primary">
                  <FileSpreadsheet className="h-5 w-5" />
                </span>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base sm:text-lg font-bold text-text-primary">
                      Original Reel Script
                    </h3>
                    <span className="rounded-full bg-primary/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary border border-primary/30">
                      COMPLETED
                    </span>
                  </div>
                  <p className="text-xs text-text-muted mt-0.5">
                    Chronological reconstruction from recorded Audio Analysis, Visual Analysis, and On-Screen Text Extraction evidence.
                  </p>
                </div>
              </div>

              {sortedRows.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap self-end sm:self-center">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleCopyRealTable}
                    leftIcon={
                      copiedTable ? (
                        <Check className="h-3.5 w-3.5 text-success" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )
                    }
                  >
                    {copiedTable ? "Copied Table" : "Copy Table"}
                  </Button>

                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleExportRealCSV}
                    leftIcon={<Download className="h-3.5 w-3.5" />}
                  >
                    Export CSV
                  </Button>
                </div>
              )}
            </div>

            {/* Source Indicators & Row Count */}
            <div className="flex items-center justify-between text-xs text-text-secondary pt-0.5 flex-wrap gap-2.5">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="inline-flex items-center gap-1 rounded bg-success/15 px-2 py-0.5 text-[10px] font-medium text-success border border-success/20">
                  <CheckCircle2 className="h-3 w-3" />
                  Audio Analysis
                </span>
                <span className="inline-flex items-center gap-1 rounded bg-success/15 px-2 py-0.5 text-[10px] font-medium text-success border border-success/20">
                  <CheckCircle2 className="h-3 w-3" />
                  Visual Analysis
                </span>
                <span className="inline-flex items-center gap-1 rounded bg-success/15 px-2 py-0.5 text-[10px] font-medium text-success border border-success/20">
                  <CheckCircle2 className="h-3 w-3" />
                  Text Extraction
                </span>
              </div>

              <span className="font-mono text-[11px] text-text-muted">
                {filteredRealRows.length} synchronized{" "}
                {filteredRealRows.length === 1 ? "row" : "rows"}
              </span>
            </div>
          </div>

          {/* Search Input Bar */}
          {sortedRows.length > 0 && (
            <div className="flex items-center justify-between gap-4">
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-muted" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search voiceover, text, or visual direction..."
                  className="w-full rounded-lg border border-card-border bg-card pl-9 pr-3 py-1.5 text-xs text-text-primary placeholder:text-text-muted focus:border-primary/50 focus:outline-none transition-colors"
                />
              </div>

              <p className="hidden sm:block text-xs text-text-muted">
                Click any timestamp to seek video player
              </p>
            </div>
          )}

          {/* Main 4-Column Real Backend Script Table */}
          <div className="rounded-xl border border-card-border bg-card overflow-hidden shadow-card">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[780px] text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-card-border bg-background-elevated text-text-muted uppercase text-[10px] tracking-wider font-semibold">
                    <th scope="col" className="py-3 px-4 w-32 sm:w-36">
                      Time
                    </th>
                    <th scope="col" className="py-3 px-4 w-[28%]">
                      Original Voiceover / Audio
                    </th>
                    <th scope="col" className="py-3 px-4 w-[26%]">
                      Exact On-Screen Text
                    </th>
                    <th scope="col" className="py-3 px-4 w-[36%]">
                      Detailed Visual Direction
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-card-border/60">
                  {sortedRows.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-10 text-center text-text-muted text-xs">
                        No synchronized script rows were returned for this video.
                      </td>
                    </tr>
                  ) : filteredRealRows.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-10 text-center text-text-muted text-xs">
                        No script rows matching "{searchQuery}".
                      </td>
                    </tr>
                  ) : (
                    filteredRealRows.map((row, idx) => {
                      const hasStartSeconds =
                        typeof row.time_start_seconds === "number" &&
                        Number.isFinite(row.time_start_seconds);
                      const voiceover = row.original_voiceover_audio?.trim() || "";
                      const screenText = row.exact_on_screen_text?.trim() || "";
                      const visualDirection = row.detailed_visual_direction?.trim() || "";
                      const rowKey = `${row.time || "row"}-${row.time_start_seconds ?? idx}-${idx}`;

                      return (
                        <tr
                          key={rowKey}
                          className="hover:bg-background-elevated/60 transition-colors group"
                        >
                          {/* 1. Time */}
                          <td className="py-3.5 px-4 align-top whitespace-nowrap">
                            {hasStartSeconds ? (
                              <button
                                type="button"
                                onClick={() => onSeek(row.time_start_seconds as number)}
                                className="inline-flex items-center gap-1.5 rounded bg-primary/10 hover:bg-primary/20 text-primary border border-primary/25 px-2 py-1 font-mono text-xs font-semibold transition-colors group-hover:border-primary/50 cursor-pointer"
                                title="Click to seek video player"
                              >
                                <Play className="h-3 w-3 fill-current" />
                                <span>{row.time || "00:00"}</span>
                              </button>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 rounded bg-background-elevated text-text-secondary border border-card-border px-2 py-1 font-mono text-xs font-semibold">
                                <Clock className="h-3 w-3 text-text-muted" />
                                <span>{row.time || "—"}</span>
                              </span>
                            )}
                          </td>

                          {/* 2. Original Voiceover / Audio */}
                          <td className="py-3.5 px-4 align-top leading-relaxed text-text-primary">
                            {voiceover ? (
                              <div className="flex items-start justify-between gap-2 rounded-lg bg-background-elevated/40 p-2.5 border border-card-border/50">
                                <span className="font-medium text-xs whitespace-pre-wrap break-words">
                                  {voiceover}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleCopyRow(`${rowKey}-vo`, voiceover)}
                                  className="p-1 rounded text-text-muted hover:text-text-primary hover:bg-background-elevated transition-colors shrink-0"
                                  title="Copy voiceover / audio"
                                  aria-label="Copy voiceover / audio"
                                >
                                  {copiedRowId === `${rowKey}-vo` ? (
                                    <Check className="h-3.5 w-3.5 text-success" />
                                  ) : (
                                    <Copy className="h-3.5 w-3.5 opacity-40 group-hover:opacity-100" />
                                  )}
                                </button>
                              </div>
                            ) : (
                              <span className="text-text-muted italic text-xs px-1">
                                —
                              </span>
                            )}
                          </td>

                          {/* 3. Exact On-Screen Text */}
                          <td className="py-3.5 px-4 align-top leading-relaxed">
                            {screenText ? (
                              <div className="flex items-start justify-between gap-2 rounded-lg bg-primary/5 p-2.5 border border-primary/20 text-text-primary font-mono font-medium text-xs">
                                <span className="whitespace-pre-wrap break-words">
                                  {screenText}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleCopyRow(`${rowKey}-txt`, screenText)}
                                  className="p-1 rounded text-text-muted hover:text-text-primary hover:bg-background-elevated transition-colors shrink-0"
                                  title="Copy on-screen text"
                                  aria-label="Copy on-screen text"
                                >
                                  {copiedRowId === `${rowKey}-txt` ? (
                                    <Check className="h-3.5 w-3.5 text-success" />
                                  ) : (
                                    <Copy className="h-3.5 w-3.5 opacity-40 group-hover:opacity-100" />
                                  )}
                                </button>
                              </div>
                            ) : (
                              <span className="text-text-muted italic text-xs px-1">
                                —
                              </span>
                            )}
                          </td>

                          {/* 4. Detailed Visual Direction */}
                          <td className="py-3.5 px-4 align-top text-text-secondary leading-relaxed">
                            {visualDirection ? (
                              <p className="text-xs font-normal whitespace-pre-wrap break-words">
                                {visualDirection}
                              </p>
                            ) : (
                              <span className="text-text-muted italic text-xs">
                                —
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* 5. Source Coverage and Accuracy Warnings */}
          <div className="rounded-xl border border-card-border bg-card p-5 space-y-5 shadow-card">
            <div className="flex items-center gap-2.5 border-b border-card-border/70 pb-3">
              <span className="p-2 rounded-lg bg-primary/15 text-primary border border-primary/25">
                <ShieldAlert className="h-4 w-4" />
              </span>
              <div>
                <h4 className="text-sm font-bold text-text-primary">
                  Source Coverage & Accuracy Warnings
                </h4>
                <p className="text-[11px] text-text-muted">
                  Models, synchronization method, and recorded coverage limitations
                </p>
              </div>
            </div>

            {/* Honest Scope Note */}
            <div className="rounded-lg border border-primary/20 bg-primary/5 p-3.5 text-xs text-text-secondary flex items-start gap-2.5 leading-relaxed">
              <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <p>
                This script reconstructs recorded evidence from the three completed source analyses
                (Audio Analysis, Visual Analysis, and On-Screen Text Extraction). It does not invent
                unrecorded dialogue or visuals, and may not contain events missed by sampled-frame analysis.
              </p>
            </div>

            {/* Source Provider & Model Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="rounded-lg bg-background-elevated/70 p-3.5 border border-card-border space-y-1.5">
                <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-text-muted">
                  <Volume2 className="h-3.5 w-3.5 text-primary" />
                  <span>Audio Analysis Source</span>
                </div>
                <div className="space-y-0.5">
                  <p className="text-text-secondary">
                    <span className="text-text-muted">Provider: </span>
                    <span className="font-mono text-text-primary">
                      {audioProvider || "Not specified"}
                    </span>
                  </p>
                  <p className="text-text-secondary break-all">
                    <span className="text-text-muted">Model: </span>
                    <span className="font-mono text-text-primary">
                      {audioModel || "Not specified"}
                    </span>
                  </p>
                </div>
              </div>

              <div className="rounded-lg bg-background-elevated/70 p-3.5 border border-card-border space-y-1.5">
                <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-text-muted">
                  <Camera className="h-3.5 w-3.5 text-primary" />
                  <span>Visual Analysis Source</span>
                </div>
                <div className="space-y-0.5">
                  <p className="text-text-secondary">
                    <span className="text-text-muted">Provider: </span>
                    <span className="font-mono text-text-primary">
                      {visualProvider || "Not specified"}
                    </span>
                  </p>
                  <p className="text-text-secondary break-all">
                    <span className="text-text-muted">Model: </span>
                    <span className="font-mono text-text-primary">
                      {visualModel || "Not specified"}
                    </span>
                  </p>
                </div>
              </div>

              <div className="rounded-lg bg-background-elevated/70 p-3.5 border border-card-border space-y-1.5">
                <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-text-muted">
                  <Type className="h-3.5 w-3.5 text-primary" />
                  <span>Text Extraction Source</span>
                </div>
                <div className="space-y-0.5">
                  <p className="text-text-secondary">
                    <span className="text-text-muted">Provider: </span>
                    <span className="font-mono text-text-primary">
                      {textProvider || "Not specified"}
                    </span>
                  </p>
                  <p className="text-text-secondary break-all">
                    <span className="text-text-muted">Model: </span>
                    <span className="font-mono text-text-primary">
                      {textModel || "Not specified"}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* Synchronization Method, Analysis Notes & Warnings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="rounded-lg bg-background-elevated/50 p-3.5 border border-card-border space-y-2.5">
                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-text-muted block mb-0.5">
                    Synchronization Method
                  </span>
                  <p className="text-text-primary font-mono text-xs">
                    {syncMethod || "Not specified"}
                  </p>
                </div>

                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-text-muted block mb-1">
                    Analysis Notes
                  </span>
                  {analysisNotesList.length > 0 ? (
                    <ul className="space-y-1 text-text-secondary">
                      {analysisNotesList.map((note, idx) => (
                        <li key={idx} className="leading-relaxed">
                          {note}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-text-muted italic">
                      No additional analysis notes recorded.
                    </p>
                  )}
                </div>
              </div>

              <div className="rounded-lg bg-background-elevated/50 p-3.5 border border-card-border space-y-2">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-text-muted block">
                  Warnings
                </span>
                {warnings.length > 0 ? (
                  <ul className="space-y-1.5 text-text-secondary">
                    {warnings.map((w, idx) => (
                      <li key={idx} className="flex items-start gap-2 leading-relaxed">
                        <AlertTriangle className="h-3.5 w-3.5 text-warning shrink-0 mt-0.5" />
                        <span>{w}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-text-muted italic">
                    No script generation warnings reported.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      );
    }

    return null;
  }

  // =========================================================================
  // DEMO PRESET FALLBACK RENDERING (PRESERVED IN FULL)
  // =========================================================================
  const handleCopyTable = () => {
    const markdown = contentAnalysisService.formatTableAsMarkdown(scriptTable);
    navigator.clipboard.writeText(markdown);
    setCopiedTable(true);
    setTimeout(() => setCopiedTable(false), 2000);
  };

  const handleExportCSV = () => {
    contentAnalysisService.exportScriptTableToCSV(scriptTable, videoTitle);
  };

  const filteredRows = (scriptTable || []).filter((row) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      (row.originalVoiceover && row.originalVoiceover.toLowerCase().includes(q)) ||
      (row.exactOnScreenText && row.exactOnScreenText.toLowerCase().includes(q)) ||
      (row.detailedVisualDirection &&
        row.detailedVisualDirection.toLowerCase().includes(q)) ||
      (row.timestamp && row.timestamp.includes(q))
    );
  });

  return (
    <div className="space-y-6">
      {/* Demo Mode / Evidence Notice */}
      {isDemoData && (
        <div className="flex items-center justify-between rounded-xl bg-primary/5 border border-primary/20 px-4 py-2.5 text-xs shadow-sm">
          <div className="flex items-center gap-2.5 text-text-secondary">
            <span className="inline-block h-2 w-2 rounded-full bg-primary animate-pulse" />
            <span className="font-semibold text-text-primary">Demo Analysis Mode</span>
            <span className="hidden sm:inline text-text-muted">
              — Displaying benchmark Reel multimodal synchronized master script
            </span>
          </div>
          <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-primary/15 text-primary border border-primary/25 font-semibold">
            Reference Sample
          </span>
        </div>
      )}

      {/* Header & Master Blueprint Toolbar */}
      <div className="rounded-xl border border-primary/25 bg-gradient-to-r from-card via-background-elevated to-card p-5 shadow-card space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-card-border/70 pb-3.5">
          <div className="flex items-center gap-2.5">
            <span className="p-2.5 rounded-lg bg-primary/20 text-primary border border-primary/30 shadow-glow-primary">
              <FileSpreadsheet className="h-5 w-5" />
            </span>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-bold text-text-primary">
                  Original Reel Script
                </h3>
                <span className="rounded-full bg-primary/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary border border-primary/30">
                  CORE MASTER BLUEPRINT
                </span>
              </div>
              <p className="text-xs text-text-muted mt-0.5">
                Exact multimodal synchronization of voiceover, on-screen text and visual staging.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap self-end sm:self-center">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleCopyTable}
              leftIcon={
                copiedTable ? (
                  <Check className="h-3.5 w-3.5 text-success" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )
              }
            >
              {copiedTable ? "Copied Table" : "Copy Table"}
            </Button>

            <Button
              variant="primary"
              size="sm"
              onClick={handleExportCSV}
              leftIcon={<Download className="h-3.5 w-3.5" />}
            >
              Export CSV
            </Button>
          </div>
        </div>

        {/* Useful Status Indicators & Row Count */}
        <div className="flex items-center justify-between text-xs text-text-secondary pt-0.5 flex-wrap gap-2.5">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="inline-flex items-center gap-1 rounded bg-success/15 px-2 py-0.5 text-[10px] font-medium text-success border border-success/20">
              <CheckCircle2 className="h-3 w-3" />
              Audio synchronized
            </span>
            <span className="inline-flex items-center gap-1 rounded bg-success/15 px-2 py-0.5 text-[10px] font-medium text-success border border-success/20">
              <CheckCircle2 className="h-3 w-3" />
              Visual analysis available
            </span>
            <span className="inline-flex items-center gap-1 rounded bg-success/15 px-2 py-0.5 text-[10px] font-medium text-success border border-success/20">
              <CheckCircle2 className="h-3 w-3" />
              OCR extraction available
            </span>
          </div>

          <span className="font-mono text-[11px] text-text-muted">
            {filteredRows.length} synchronized intervals
          </span>
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search voiceover, text, or visual action..."
            className="w-full rounded-lg border border-card-border bg-card pl-9 pr-3 py-1.5 text-xs text-text-primary placeholder:text-text-muted focus:border-primary/50 focus:outline-none transition-colors"
          />
        </div>

        <p className="hidden sm:block text-xs text-text-muted">
          Click any timestamp to seek video player
        </p>
      </div>

      {/* Main 4-Column Script Table */}
      <div className="rounded-xl border border-card-border bg-card overflow-hidden shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[760px] text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-card-border bg-background-elevated text-text-muted uppercase text-[10px] tracking-wider font-semibold">
                <th scope="col" className="py-3 px-4 w-32 sm:w-36">
                  Time
                </th>
                <th scope="col" className="py-3 px-4 w-[30%]">
                  Original Voiceover / Audio
                </th>
                <th scope="col" className="py-3 px-4 w-[28%]">
                  Exact On-Screen Text
                </th>
                <th scope="col" className="py-3 px-4 w-[34%]">
                  Visual Direction
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-card-border/60">
              {filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-10 text-center text-text-muted text-xs">
                    {searchQuery
                      ? `No script intervals matching "${searchQuery}".`
                      : "No script data available."}
                  </td>
                </tr>
              ) : (
                filteredRows.map((row) => (
                  <tr
                    key={row.id}
                    className="hover:bg-background-elevated/60 transition-colors group"
                  >
                    {/* Column 1: Time */}
                    <td className="py-3.5 px-4 align-top whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => onSeek(row.startTime)}
                        className="inline-flex items-center gap-1.5 rounded bg-primary/10 hover:bg-primary/20 text-primary border border-primary/25 px-2 py-1 font-mono text-xs font-semibold transition-colors group-hover:border-primary/50"
                        title="Click to seek video player"
                      >
                        <Play className="h-3 w-3 fill-current" />
                        <span>{row.timestamp}</span>
                      </button>
                    </td>

                    {/* Column 2: Original Voiceover / Audio */}
                    <td className="py-3.5 px-4 align-top leading-relaxed text-text-primary">
                      <div className="flex items-start justify-between gap-2 rounded-lg bg-background-elevated/40 p-2.5 border border-card-border/50">
                        <span className="font-medium">
                          {row.originalVoiceover ? `"${row.originalVoiceover}"` : "—"}
                        </span>
                        {row.originalVoiceover && (
                          <button
                            type="button"
                            onClick={() =>
                              handleCopyRow(`${row.id}-vo`, row.originalVoiceover)
                            }
                            className="p-1 rounded text-text-muted hover:text-text-primary hover:bg-background-elevated transition-colors shrink-0"
                            title="Copy voiceover"
                            aria-label="Copy voiceover"
                          >
                            {copiedRowId === `${row.id}-vo` ? (
                              <Check className="h-3.5 w-3.5 text-success" />
                            ) : (
                              <Copy className="h-3.5 w-3.5 opacity-40 group-hover:opacity-100" />
                            )}
                          </button>
                        )}
                      </div>
                    </td>

                    {/* Column 3: Exact On-Screen Text */}
                    <td className="py-3.5 px-4 align-top leading-relaxed">
                      {row.exactOnScreenText &&
                      row.exactOnScreenText.trim().length > 0 &&
                      !row.exactOnScreenText
                        .toLowerCase()
                        .includes("no on-screen text") ? (
                        <div className="flex items-start justify-between gap-2 rounded-lg bg-cta/5 p-2.5 border border-cta/20 text-cta font-mono font-semibold text-xs">
                          <span className="break-words">{row.exactOnScreenText}</span>
                          <button
                            type="button"
                            onClick={() =>
                              handleCopyRow(`${row.id}-txt`, row.exactOnScreenText)
                            }
                            className="p-1 rounded text-text-muted hover:text-text-primary hover:bg-background-elevated transition-colors shrink-0"
                            title="Copy on-screen text"
                            aria-label="Copy on-screen text"
                          >
                            {copiedRowId === `${row.id}-txt` ? (
                              <Check className="h-3.5 w-3.5 text-success" />
                            ) : (
                              <Copy className="h-3.5 w-3.5 opacity-40 group-hover:opacity-100" />
                            )}
                          </button>
                        </div>
                      ) : (
                        <span className="text-text-muted italic text-xs px-1">
                          No on-screen text detected.
                        </span>
                      )}
                    </td>

                    {/* Column 4: Visual Direction */}
                    <td className="py-3.5 px-4 align-top text-text-secondary leading-relaxed">
                      <p className="text-xs font-normal">
                        {row.detailedVisualDirection ||
                          "No significant visual change detected."}
                      </p>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default OriginalScriptTable;
