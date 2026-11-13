import React, { useState } from "react";
import {
  Type,
  Copy,
  Check,
  Play,
  Search,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Sparkles,
  RotateCcw,
  Globe,
  Info,
  FileText,
} from "lucide-react";
import {
  TextExtractionData,
  OnScreenTextElement,
  TextExtractionBackendResult,
  TextExtractionStatus,
} from "../types/analysis";
import { Button } from "@/components/buttons";

export interface TextExtractionProps {
  data?: TextExtractionData;
  realData?: TextExtractionBackendResult | null;
  onSeek: (seconds: number) => void;
  isDemoData?: boolean;
  status?: TextExtractionStatus | null;
  errorMessage?: string | null;
  onRetry?: () => void;
  onExtractText?: () => void;
  isProcessing?: boolean;
  progressStepMessage?: string | null;
}

interface RelevantTextMeta {
  position?: string;
  style?: string;
  color?: string;
  animation?: string;
}

function formatMinutesAndSeconds(seconds?: number | null): string {
  if (typeof seconds !== "number" || Number.isNaN(seconds) || seconds < 0) {
    return "00:00";
  }
  const totalSeconds = Math.floor(seconds);
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

function formatPosition(pos: string | undefined): string | undefined {
  if (!pos) return undefined;
  const p = pos.toLowerCase();
  if (p.includes("top")) return "Top";
  if (p.includes("bottom")) return "Bottom";
  if (p.includes("lower")) return "Lower third";
  if (p.includes("left")) return "Left";
  if (p.includes("right")) return "Right";
  return undefined; // Standard center position is not necessary to repeat
}

function formatStyle(desc: string | undefined): string | undefined {
  if (!desc) return undefined;
  const styles: string[] = [];
  if (/bold|heavy|extrabold/i.test(desc)) styles.push("Bold");
  if (/italic/i.test(desc)) styles.push("Italic");
  if (/uppercase|all-caps/i.test(desc)) styles.push("Uppercase");
  if (/handwritten/i.test(desc)) styles.push("Handwritten");
  if (/outlined/i.test(desc)) styles.push("Outlined");
  return styles.length > 0 ? styles.join(", ") : undefined;
}

function formatColor(color: string | undefined): string | undefined {
  if (!color) return undefined;
  const matchNamed = color.match(/\(([^)]+)\)/);
  if (matchNamed && matchNamed[1]) return matchNamed[1];
  if (/violet|purple/i.test(color)) return "Violet";
  if (/red/i.test(color)) return "Red";
  if (/orange/i.test(color)) return "Orange";
  if (/amber|gold/i.test(color)) return "Amber";
  if (/green/i.test(color)) return "Green";
  if (/cyan|blue/i.test(color)) return "Blue";
  return undefined;
}

function formatAnimation(isAnimated: boolean, animType: string | undefined): string | undefined {
  if (!isAnimated || !animType) return undefined;
  return animType
    .replace(/\([^)]+\)/g, "")
    .replace(/elastic|spring|motion blur|continuous|subtle/gi, "")
    .trim() || undefined;
}

/**
 * Extracts visible styling and positioning ONLY when relevant to understanding the text.
 * Strictly adheres to rule: never invent font families, numerical sizes, or unobservable effects.
 */
function getRelevantMetadata(el: OnScreenTextElement): RelevantTextMeta | null {
  const position = formatPosition(el.position);
  const style = formatStyle(el.fontStyleDescription);
  const color = formatColor(el.textColor);
  const animation = formatAnimation(el.isAnimated, el.animationType);

  if (!position && !style && !color && !animation) {
    return null;
  }

  return { position, style, color, animation };
}

export const TextExtraction: React.FC<TextExtractionProps> = ({
  data,
  realData,
  onSeek,
  isDemoData = false,
  status,
  errorMessage,
  onRetry,
  onExtractText,
  isProcessing = false,
  progressStepMessage,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const normalizedStatus = String(status || "").trim().toLowerCase();
  const isCompletedStatus = normalizedStatus === "completed";
  const isFailedStatus = normalizedStatus === "failed";
  const isQueuedStatus = normalizedStatus === "queued";
  const isGroqFallbackStage =
    normalizedStatus.includes("groq") || normalizedStatus.includes("fallback");
  const isBackendActiveStatus =
    isQueuedStatus ||
    normalizedStatus === "processing" ||
    isGroqFallbackStage;

  // 1. Completed + saved result renders immediately
  const shouldRenderCompletedRealData = Boolean(realData) && isCompletedStatus;

  // 2. Active submission / queued / processing state
  const showActiveProgress =
    !shouldRenderCompletedRealData &&
    ((isProcessing && Boolean(progressStepMessage)) ||
      (isBackendActiveStatus && !isFailedStatus));

  if (showActiveProgress) {
    const activeHeading =
      progressStepMessage ||
      (isGroqFallbackStage
        ? "Fallback model is extracting on-screen text..."
        : isQueuedStatus
        ? "On-Screen Text Extraction Queued..."
        : "Extracting On-Screen Text...");

    const activeDescription = progressStepMessage
      ? "Preparing representative video frames from your uploaded Reel before submitting text extraction."
      : isQueuedStatus
      ? "Your Reel on-screen text extraction job is queued in the background. Checking status every 5 seconds..."
      : "Reading visible captions, text overlays, and on-screen typography from your uploaded Reel.";

    const activeFooterLabel = progressStepMessage
      ? "Submitting text extraction job"
      : isQueuedStatus
      ? "Job queued • Checking status every 5 seconds"
      : "Processing in background • Checking status every 5 seconds";

    return (
      <div className="rounded-2xl border border-primary/30 bg-card p-8 sm:p-12 shadow-card text-center space-y-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 text-primary mx-auto">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
        <div className="max-w-md mx-auto space-y-2">
          <h3 className="text-lg font-bold text-text-primary">
            {activeHeading}
          </h3>
          <p className="text-xs text-text-secondary leading-relaxed">
            {activeDescription}
          </p>
          <div className="pt-2 text-[11px] font-mono text-text-muted flex items-center justify-center gap-2">
            <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            <span>{activeFooterLabel}</span>
          </div>
        </div>
      </div>
    );
  }

  // 3. Failed state with Retry action
  if (!shouldRenderCompletedRealData && (isFailedStatus || (!realData && Boolean(errorMessage)))) {
    return (
      <div className="rounded-2xl border border-error/30 bg-card p-6 sm:p-8 shadow-card space-y-4">
        <div className="flex items-start gap-3.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-error/15 text-error shrink-0 border border-error/25">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div className="space-y-1 flex-1">
            <h3 className="text-base font-bold text-text-primary">
              On-Screen Text Extraction Failed
            </h3>
            <p className="text-xs text-error leading-relaxed">
              {errorMessage ||
                "The backend encountered an error while extracting on-screen text from your Reel."}
            </p>
            <p className="text-[11px] text-text-muted mt-1">
              Your uploaded Reel is securely saved in storage. You do not need to re-upload your video to retry text extraction.
            </p>
          </div>
        </div>

        {onRetry && (
          <div className="flex justify-end pt-2 border-t border-card-border/80">
            <Button
              variant="primary"
              size="sm"
              onClick={onRetry}
              disabled={isProcessing}
              leftIcon={<RotateCcw className="h-4 w-4" />}
            >
              Retry Text Extraction
            </Button>
          </div>
        )}
      </div>
    );
  }

  // 4. Pending / Not Extracted State (explicit manual trigger only)
  if (!realData && !data && (normalizedStatus === "pending" || !normalizedStatus)) {
    return (
      <div className="rounded-2xl border border-card-border bg-card p-8 sm:p-10 shadow-card text-center space-y-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 text-primary mx-auto">
          <Type className="h-8 w-8" />
        </div>
        <div className="max-w-md mx-auto space-y-2">
          <h3 className="text-lg font-bold text-text-primary">
            On-Screen Text Extraction
          </h3>
          <p className="text-xs text-text-secondary leading-relaxed">
            Extract visible captions, titles, overlays, and on-screen typography with timestamps, screen positions, readability, and detected languages from your uploaded Reel.
          </p>
        </div>
        {onExtractText && (
          <div className="pt-2">
            <Button
              variant="primary"
              size="lg"
              onClick={onExtractText}
              disabled={isProcessing}
              leftIcon={<Sparkles className="h-5 w-5" />}
              className="shadow-glow-primary py-3 px-6 cursor-pointer"
            >
              {isProcessing ? "Submitting..." : "Extract Text"}
            </Button>
          </div>
        )}
      </div>
    );
  }

  // 5. Completed status with missing payload edge case
  if (isCompletedStatus && !realData && !data) {
    return (
      <div className="rounded-2xl border border-card-border bg-card p-6 sm:p-8 shadow-card space-y-4">
        <div className="flex items-start gap-3.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-warning/15 text-warning shrink-0 border border-warning/25">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div className="space-y-1 flex-1">
            <h3 className="text-base font-bold text-text-primary">
              On-Screen Text Extraction Result Unavailable
            </h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              This analysis record is marked as completed, but no text extraction payload was saved.
            </p>
          </div>
        </div>
        {onRetry && (
          <div className="flex justify-end pt-2 border-t border-card-border/80">
            <Button
              variant="primary"
              size="sm"
              onClick={onRetry}
              disabled={isProcessing}
              leftIcon={<RotateCcw className="h-4 w-4" />}
            >
              Retry Text Extraction
            </Button>
          </div>
        )}
      </div>
    );
  }

  // =========================================================================
  // 6. REAL BACKEND DATA RENDERING (TextExtractionBackendResult)
  // =========================================================================
  if (realData) {
    const rawSegments = Array.isArray(realData.text_segments) ? realData.text_segments : [];
    const sortedSegments = [...rawSegments].sort(
      (a, b) =>
        (a.start_time_seconds ?? 0) - (b.start_time_seconds ?? 0) ||
        (a.end_time_seconds ?? 0) - (b.end_time_seconds ?? 0)
    );
    const languagesVisible = Array.isArray(realData.languages_visible)
      ? realData.languages_visible.filter(Boolean)
      : [];
    const metadata = realData.analysis_metadata || {};
    const warnings = Array.isArray(metadata.warnings) ? metadata.warnings.filter(Boolean) : [];
    const providerModelLabel = [metadata.provider, metadata.model].filter(Boolean).join(" / ");

    const filteredSegments = sortedSegments.filter((seg) =>
      (seg.extracted_text || "").toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleCopyRealRow = (idx: number, text: string) => {
      navigator.clipboard.writeText(text);
      setCopiedId(`real-${idx}`);
      setTimeout(() => setCopiedId(null), 1800);
    };

    const handleCopyAllReal = () => {
      const allText = sortedSegments
        .map(
          (seg) =>
            `[${formatMinutesAndSeconds(seg.start_time_seconds)}–${formatMinutesAndSeconds(
              seg.end_time_seconds
            )}] ${seg.extracted_text}`
        )
        .join("\n");
      navigator.clipboard.writeText(allText);
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 2000);
    };

    return (
      <div className="space-y-6">
        {/* Completion Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 rounded-xl bg-primary/10 border border-primary/25 px-4 py-3 text-xs shadow-sm">
          <div className="flex items-center gap-2.5 text-text-secondary">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-success" />
            <span className="font-semibold text-text-primary">
              On-Screen Text Extraction Completed
            </span>
            {providerModelLabel && (
              <span className="hidden sm:inline text-text-muted">
                — {providerModelLabel}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {providerModelLabel && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-primary/15 text-primary border border-primary/25 font-semibold">
                {providerModelLabel}
              </span>
            )}
            {sortedSegments.length > 0 && (
              <Button
                variant="secondary"
                size="sm"
                onClick={handleCopyAllReal}
                leftIcon={
                  copiedAll ? (
                    <Check className="h-3.5 w-3.5 text-success" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )
                }
              >
                {copiedAll ? "Copied All Text" : "Copy All Extracted Text"}
              </Button>
            )}
          </div>
        </div>

        {/* A. Text Summary */}
        <div className="rounded-xl border border-card-border bg-card p-5 space-y-3 shadow-card">
          <div className="flex items-center gap-2.5 border-b border-card-border/60 pb-3">
            <span className="p-2 rounded-lg bg-primary/15 text-primary border border-primary/25">
              <FileText className="h-4 w-4" />
            </span>
            <div>
              <h3 className="text-sm font-bold text-text-primary">
                A. Text Summary
              </h3>
              <p className="text-[11px] text-text-muted">
                Overview of visible on-screen text across the Reel
              </p>
            </div>
          </div>

          <p className="text-xs leading-relaxed text-text-primary">
            {realData.video_text_summary?.trim() ||
              (sortedSegments.length === 0
                ? "No readable on-screen text was detected in the analyzed video."
                : "On-screen text segments extracted chronologically below.")}
          </p>
        </div>

        {/* B. Extracted Text Timeline */}
        <div className="rounded-xl border border-card-border bg-card p-5 space-y-4 shadow-card">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-card-border/80 pb-3">
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-lg bg-primary/15 text-primary border border-primary/25">
                <Type className="h-4 w-4" />
              </span>
              <div>
                <h3 className="text-sm font-bold text-text-primary">
                  B. Extracted Text Timeline ({sortedSegments.length}{" "}
                  {sortedSegments.length === 1 ? "Segment" : "Segments"})
                </h3>
                <p className="text-[11px] text-text-muted">
                  Chronological record of visible on-screen text overlays and captions
                </p>
              </div>
            </div>

            {sortedSegments.length > 0 && (
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-muted" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search extracted text..."
                  className="w-full rounded-lg border border-card-border bg-background-elevated/70 pl-9 pr-3 py-1.5 text-xs text-text-primary placeholder:text-text-muted focus:border-primary/50 focus:outline-none transition-colors"
                />
              </div>
            )}
          </div>

          {sortedSegments.length === 0 ? (
            <div className="py-10 text-center space-y-1">
              <p className="text-sm font-semibold text-text-primary">
                No readable on-screen text was detected in the analyzed video.
              </p>
            </div>
          ) : filteredSegments.length === 0 ? (
            <div className="py-8 text-center text-xs text-text-muted">
              No on-screen text matching "{searchQuery}".
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-card-border">
              <table className="w-full text-left text-xs">
                <thead className="bg-background-elevated border-b border-card-border text-[11px] uppercase tracking-wider text-text-muted font-semibold">
                  <tr>
                    <th scope="col" className="px-3.5 py-2.5 whitespace-nowrap">
                      Start Time
                    </th>
                    <th scope="col" className="px-3.5 py-2.5 whitespace-nowrap">
                      End Time
                    </th>
                    <th scope="col" className="px-3.5 py-2.5 min-w-[200px]">
                      Extracted Text
                    </th>
                    <th scope="col" className="px-3.5 py-2.5 whitespace-nowrap">
                      Position on Screen
                    </th>
                    <th scope="col" className="px-3.5 py-2.5 whitespace-nowrap">
                      Text Type
                    </th>
                    <th scope="col" className="px-3.5 py-2.5 whitespace-nowrap">
                      Readability
                    </th>
                    <th scope="col" className="px-3.5 py-2.5">
                      Uncertain Characters
                    </th>
                    <th scope="col" className="px-3.5 py-2.5">
                      Notes
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-card-border/60 bg-card">
                  {filteredSegments.map((seg, idx) => (
                    <tr
                      key={`${seg.start_time_seconds}-${seg.end_time_seconds}-${idx}`}
                      className="hover:bg-background-elevated/50 transition-colors group"
                    >
                      <td className="px-3.5 py-3 align-top whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => onSeek(seg.start_time_seconds)}
                          className="inline-flex items-center gap-1 rounded bg-primary/10 hover:bg-primary/20 text-primary border border-primary/25 px-2 py-0.5 font-mono text-[11px] font-semibold transition-colors cursor-pointer"
                          title="Seek video to start time"
                        >
                          <Play className="h-2.5 w-2.5 fill-current" />
                          <span>{formatMinutesAndSeconds(seg.start_time_seconds)}</span>
                        </button>
                      </td>
                      <td className="px-3.5 py-3 align-top whitespace-nowrap font-mono text-text-secondary text-[11px]">
                        {formatMinutesAndSeconds(seg.end_time_seconds)}
                      </td>
                      <td className="px-3.5 py-3 align-top">
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-text-primary font-medium leading-relaxed whitespace-pre-wrap">
                            {seg.extracted_text || "—"}
                          </span>
                          {seg.extracted_text && (
                            <button
                              type="button"
                              onClick={() => handleCopyRealRow(idx, seg.extracted_text)}
                              className="p-1 rounded text-text-muted hover:text-text-primary hover:bg-background-elevated transition-colors shrink-0"
                              title="Copy extracted text"
                              aria-label="Copy extracted text"
                            >
                              {copiedId === `real-${idx}` ? (
                                <Check className="h-3.5 w-3.5 text-success" />
                              ) : (
                                <Copy className="h-3.5 w-3.5 opacity-60 group-hover:opacity-100" />
                              )}
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="px-3.5 py-3 align-top text-text-secondary">
                        {seg.position_on_screen || "—"}
                      </td>
                      <td className="px-3.5 py-3 align-top text-text-secondary">
                        {seg.text_type || "—"}
                      </td>
                      <td className="px-3.5 py-3 align-top text-text-secondary">
                        {seg.readability || "—"}
                      </td>
                      <td className="px-3.5 py-3 align-top text-text-secondary font-mono text-[11px]">
                        {seg.uncertain_characters || "None"}
                      </td>
                      <td className="px-3.5 py-3 align-top text-text-secondary">
                        {seg.notes || "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* C. Languages Detected & D. Accuracy and Warnings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* C. Languages Detected */}
          <div className="rounded-xl border border-card-border bg-card p-5 space-y-3 shadow-card">
            <div className="flex items-center gap-2.5 border-b border-card-border/60 pb-3">
              <span className="p-2 rounded-lg bg-primary/15 text-primary border border-primary/25">
                <Globe className="h-4 w-4" />
              </span>
              <div>
                <h3 className="text-sm font-bold text-text-primary">
                  C. Languages Detected
                </h3>
                <p className="text-[11px] text-text-muted">
                  Visible languages identified in on-screen text
                </p>
              </div>
            </div>

            {languagesVisible.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {languagesVisible.map((lang, idx) => (
                  <span
                    key={`${lang}-${idx}`}
                    className="inline-flex items-center gap-1.5 rounded-md bg-background-elevated px-2.5 py-1 text-xs font-medium text-text-primary border border-card-border"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                    <span>{lang}</span>
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-text-muted italic">
                No visible text languages detected.
              </p>
            )}
          </div>

          {/* D. Accuracy and Warnings */}
          <div className="rounded-xl border border-card-border bg-card p-5 space-y-3 shadow-card">
            <div className="flex items-center gap-2.5 border-b border-card-border/60 pb-3">
              <span className="p-2 rounded-lg bg-primary/15 text-primary border border-primary/25">
                <Info className="h-4 w-4" />
              </span>
              <div>
                <h3 className="text-sm font-bold text-text-primary">
                  D. Accuracy and Warnings
                </h3>
                <p className="text-[11px] text-text-muted">
                  Provider metadata and extraction observations
                </p>
              </div>
            </div>

            {(metadata.provider || metadata.model) && (
              <div className="grid grid-cols-2 gap-2 text-xs">
                {metadata.provider && (
                  <div className="rounded-lg bg-background-elevated/70 p-2.5 border border-card-border">
                    <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider block">
                      Provider
                    </span>
                    <span className="text-text-primary font-mono font-medium">
                      {metadata.provider}
                    </span>
                  </div>
                )}
                {metadata.model && (
                  <div className="rounded-lg bg-background-elevated/70 p-2.5 border border-card-border">
                    <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider block">
                      Model
                    </span>
                    <span className="text-text-primary font-mono font-medium break-all">
                      {metadata.model}
                    </span>
                  </div>
                )}
              </div>
            )}

            {warnings.length > 0 ? (
              <ul className="space-y-1.5 text-xs text-text-secondary">
                {warnings.map((w, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <AlertTriangle className="h-3.5 w-3.5 text-warning shrink-0 mt-0.5" />
                    <span>{w}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-text-muted italic">
                No extraction warnings reported.
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 7. DEMO PRESET FALLBACK RENDERING (PRESERVED IN FULL)
  // =========================================================================
  const elements = data?.textElements || [];

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const handleCopyAll = () => {
    const allText = elements
      .map((t) => `[${t.timestamp}] ${t.exactText}`)
      .join("\n");
    navigator.clipboard.writeText(allText);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  const filteredElements = elements.filter((el) =>
    el.exactText.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Demo Mode / Evidence Notice */}
      {isDemoData && (
        <div className="flex items-center justify-between rounded-xl bg-primary/5 border border-primary/20 px-4 py-2.5 text-xs shadow-sm">
          <div className="flex items-center gap-2.5 text-text-secondary">
            <span className="inline-block h-2 w-2 rounded-full bg-primary animate-pulse" />
            <span className="font-semibold text-text-primary">Demo Analysis Mode</span>
            <span className="hidden sm:inline text-text-muted">
              — Displaying benchmark Reel on-screen visual OCR text
            </span>
          </div>
          <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-primary/15 text-primary border border-primary/25 font-semibold">
            Reference Sample
          </span>
        </div>
      )}

      {/* Main Container Card */}
      <div className="rounded-xl border border-card-border bg-card p-5 space-y-4 shadow-card">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-card-border/80 pb-3">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-lg bg-primary/15 text-primary border border-primary/25">
              <Type className="h-4 w-4" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-text-primary">
                  On-Screen Text Extraction
                </h3>
                <span className="inline-flex items-center gap-1 rounded bg-success/15 px-2 py-0.2 text-[10px] font-semibold text-success border border-success/20">
                  <CheckCircle2 className="h-3 w-3" />
                  Visual OCR
                </span>
              </div>
              <p className="text-xs text-text-muted mt-0.5">
                Exact text visibly displayed within video frames with timestamps.
              </p>
            </div>
          </div>

          {elements.length > 0 && (
            <div className="flex items-center gap-2.5 self-end sm:self-center">
              <Button
                variant="secondary"
                size="sm"
                onClick={handleCopyAll}
                leftIcon={
                  copiedAll ? (
                    <Check className="h-3.5 w-3.5 text-success" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )
                }
              >
                {copiedAll ? "Copied All Text" : "Copy All Extracted Text"}
              </Button>
            </div>
          )}
        </div>

        {/* Search Bar (Only shown if elements exist) */}
        {elements.length > 0 && (
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search extracted text..."
              className="w-full rounded-lg border border-card-border bg-background-elevated/70 pl-9 pr-3 py-1.5 text-xs text-text-primary placeholder:text-text-muted focus:border-primary/50 focus:outline-none transition-colors"
            />
          </div>
        )}

        {/* Main Output: Clean Two-Column Table */}
        {elements.length === 0 ? (
          <div className="py-12 text-center space-y-1">
            <p className="text-sm font-semibold text-text-primary">
              No on-screen text detected.
            </p>
            <p className="text-xs text-text-muted">
              No visible captions, text overlays, or typography appeared in this video.
            </p>
          </div>
        ) : filteredElements.length === 0 ? (
          <div className="py-8 text-center text-xs text-text-muted">
            No on-screen text matching "{searchQuery}".
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-card-border">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-background-elevated border-b border-card-border text-[11px] uppercase tracking-wider text-text-muted font-semibold">
                <tr>
                  <th scope="col" className="w-36 sm:w-44 px-4 py-3">
                    Time
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Exact Extracted Text
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-card-border/60 bg-card">
                {filteredElements.map((el) => {
                  const meta = getRelevantMetadata(el);
                  return (
                    <tr
                      key={el.id}
                      className="hover:bg-background-elevated/60 transition-colors group"
                    >
                      {/* Column 1: Time */}
                      <td className="px-4 py-3 align-top whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => onSeek(el.startTime)}
                          className="inline-flex items-center gap-1.5 rounded bg-primary/10 hover:bg-primary/20 text-primary border border-primary/25 px-2 py-1 font-mono text-xs font-semibold transition-colors group-hover:border-primary/50"
                          title="Seek video to text appearance"
                        >
                          <Play className="h-3 w-3 fill-current" />
                          <span>{el.timestamp}</span>
                        </button>
                      </td>

                      {/* Column 2: Exact Extracted Text */}
                      <td className="px-4 py-3 align-top">
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1.5">
                            {/* Exact Text preserving original casing, punctuation, symbols */}
                            <p className="text-text-primary font-medium leading-relaxed sm:text-base">
                              {el.exactText}
                            </p>

                            {/* Relevant styling & positioning details (ONLY when relevant) */}
                            {meta && (
                              <div className="flex items-center gap-1.5 flex-wrap text-[11px] text-text-muted pt-0.5">
                                {meta.position && (
                                  <span className="rounded bg-background-elevated px-2 py-0.5 font-mono text-text-secondary border border-card-border">
                                    {meta.position}
                                  </span>
                                )}
                                {meta.style && (
                                  <span className="rounded bg-background-elevated px-2 py-0.5 text-text-secondary border border-card-border">
                                    {meta.style}
                                  </span>
                                )}
                                {meta.color && (
                                  <span className="rounded bg-background-elevated px-2 py-0.5 text-text-secondary border border-card-border">
                                    {meta.color}
                                  </span>
                                )}
                                {meta.animation && (
                                  <span className="rounded bg-primary/10 px-2 py-0.5 text-primary border border-primary/25 font-mono text-[10px]">
                                    {meta.animation}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Quick copy row action */}
                          <button
                            type="button"
                            onClick={() => handleCopyText(el.id, el.exactText)}
                            className="p-1.5 rounded text-text-muted hover:text-text-primary hover:bg-background-elevated transition-colors shrink-0"
                            title="Copy exact text"
                            aria-label="Copy exact text"
                          >
                            {copiedId === el.id ? (
                              <Check className="h-4 w-4 text-success" />
                            ) : (
                              <Copy className="h-4 w-4 opacity-60 group-hover:opacity-100" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default TextExtraction;
