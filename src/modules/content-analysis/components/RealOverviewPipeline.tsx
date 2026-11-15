import React from "react";
import {
  Volume2,
  Camera,
  Type,
  FileSpreadsheet,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Loader2,
  Sparkles,
  RotateCcw,
  ArrowRight,
  Layers,
  RefreshCw,
} from "lucide-react";
import {
  ContentAnalysisRecord,
  AnalysisTabType,
  OriginalScriptSourceStatuses,
} from "../types/analysis";
import { VideoPreviewPlayer, VideoPreviewPlayerRef } from "./VideoPreviewPlayer";
import { OriginalScriptTable } from "./OriginalScriptTable";
import { Button } from "@/components/buttons";
import { cn } from "@/utils/cn";

export type OverviewModuleDisplayStatus =
  | "Pending"
  | "Processing"
  | "Completed"
  | "Failed";

export interface RealOverviewPipelineProps {
  record: ContentAnalysisRecord;
  signedVideoUrl: string | null;
  playerRef: React.RefObject<VideoPreviewPlayerRef>;
  onSeek: (seconds: number) => void;
  isAnalyzingAudio: boolean;
  isAnalyzingVisual: boolean;
  isExtractingText: boolean;
  isGeneratingScript: boolean;
  isRefreshing?: boolean;
  audioAnalysisError: string | null;
  visualAnalysisError: string | null;
  guidedFrameError?: string | null;
  textExtractionError: string | null;
  originalScriptError: string | null;
  originalScriptErrorCode: string | null;
  originalScriptIncompleteSources: OriginalScriptSourceStatuses | null;
  onViewAudio: () => void;
  onViewVisual: () => void;
  onViewText: () => void;
  onViewScript: () => void;
  onAnalyzeAudio: () => void;
  onAnalyzeVisual: () => void;
  onExtractText: () => void;
  onGenerateOriginalScript: () => void;
  onRetryOriginalScript: () => void;
  onRefreshStatus?: () => void;
  onSelectTab: (tab: AnalysisTabType) => void;
}

function normalizeStatus(status?: string | null): string {
  return String(status || "").trim().toLowerCase();
}

function isVisualActiveStatus(record: ContentAnalysisRecord): boolean {
  const overall = normalizeStatus(record.visual_analysis_status);
  const step1 = normalizeStatus(record.visual_analysis_step1_status);
  const step2 = normalizeStatus(record.visual_analysis_step2_status);
  const frameSelection = normalizeStatus(record.visual_analysis_frame_selection_status);

  if (overall === "completed" || overall === "failed" || frameSelection === "failed") {
    return false;
  }

  const isActiveStr = (s: string) =>
    s === "queued" ||
    s === "processing" ||
    s.includes("step1") ||
    s.includes("step2") ||
    s.includes("gemini") ||
    s.includes("groq") ||
    s.includes("fallback") ||
    s.includes("awaiting") ||
    s.includes("frame");

  return (
    isActiveStr(overall) ||
    step1 === "processing" ||
    step1 === "queued" ||
    step2 === "processing" ||
    step2 === "queued" ||
    frameSelection === "awaiting_upload"
  );
}

function isTextActiveStatus(status?: string | null): boolean {
  const s = normalizeStatus(status);
  if (!s || s === "completed" || s === "failed" || s === "pending") return false;
  return (
    s === "queued" ||
    s === "processing" ||
    s.includes("groq") ||
    s.includes("fallback")
  );
}

export function hasSavedAudioResult(record: ContentAnalysisRecord): boolean {
  return Boolean(record.audio_analysis && typeof record.audio_analysis === "object");
}

export function hasSavedVisualResult(record: ContentAnalysisRecord): boolean {
  return Boolean(record.visual_analysis && typeof record.visual_analysis === "object");
}

export function hasSavedTextResult(record: ContentAnalysisRecord): boolean {
  return Boolean(record.text_extraction && typeof record.text_extraction === "object");
}

export function hasSavedOriginalScriptResult(record: ContentAnalysisRecord): boolean {
  return Boolean(
    record.original_script &&
      typeof record.original_script === "object" &&
      Array.isArray(record.original_script.rows)
  );
}

function getStatusBadgeStyles(status: OverviewModuleDisplayStatus): string {
  switch (status) {
    case "Completed":
      return "bg-success/15 text-success border-success/30";
    case "Processing":
      return "bg-primary/15 text-primary border-primary/35";
    case "Failed":
      return "bg-error/15 text-error border-error/30";
    case "Pending":
    default:
      return "bg-background text-text-muted border-card-border";
  }
}

function getCardBorderStyles(status: OverviewModuleDisplayStatus): string {
  switch (status) {
    case "Completed":
      return "border-success/30 bg-success/5";
    case "Processing":
      return "border-primary/35 bg-primary/5";
    case "Failed":
      return "border-error/30 bg-error/5";
    case "Pending":
    default:
      return "border-card-border bg-background-elevated/60";
  }
}

function renderStatusIcon(status: OverviewModuleDisplayStatus) {
  switch (status) {
    case "Completed":
      return <CheckCircle2 className="h-3.5 w-3.5 text-success shrink-0" />;
    case "Processing":
      return <Loader2 className="h-3.5 w-3.5 text-primary animate-spin shrink-0" />;
    case "Failed":
      return <AlertTriangle className="h-3.5 w-3.5 text-error shrink-0" />;
    case "Pending":
    default:
      return <Clock className="h-3.5 w-3.5 text-text-muted shrink-0" />;
  }
}

export const RealOverviewPipeline: React.FC<RealOverviewPipelineProps> = ({
  record,
  signedVideoUrl,
  playerRef,
  onSeek,
  isAnalyzingAudio,
  isAnalyzingVisual,
  isExtractingText,
  isGeneratingScript,
  isRefreshing = false,
  audioAnalysisError,
  visualAnalysisError,
  guidedFrameError,
  textExtractionError,
  originalScriptError,
  originalScriptErrorCode,
  originalScriptIncompleteSources,
  onViewAudio,
  onViewVisual,
  onViewText,
  onViewScript,
  onAnalyzeAudio,
  onAnalyzeVisual,
  onExtractText,
  onGenerateOriginalScript,
  onRetryOriginalScript,
  onRefreshStatus,
  onSelectTab,
}) => {
  // 1. Real Audio Analysis status (Completed ONLY when DB status === completed AND audio_analysis exists)
  const rawAudioStatus = normalizeStatus(record.audio_analysis_status);
  const audioSaved = hasSavedAudioResult(record);
  const audioStatus: OverviewModuleDisplayStatus =
    rawAudioStatus === "completed" && audioSaved
      ? "Completed"
      : rawAudioStatus === "failed"
      ? "Failed"
      : rawAudioStatus === "processing" || rawAudioStatus === "queued" || isAnalyzingAudio
      ? "Processing"
      : "Pending";

  // 2. Real Visual Analysis status (Completed ONLY when DB status === completed AND visual_analysis exists)
  const rawVisualStatus = normalizeStatus(record.visual_analysis_status);
  const rawFrameSelectionStatus = normalizeStatus(
    record.visual_analysis_frame_selection_status
  );
  const visualSaved = hasSavedVisualResult(record);
  const visualStatus: OverviewModuleDisplayStatus =
    rawVisualStatus === "completed" && visualSaved
      ? "Completed"
      : rawVisualStatus === "failed" || rawFrameSelectionStatus === "failed"
      ? "Failed"
      : isVisualActiveStatus(record) || isAnalyzingVisual
      ? "Processing"
      : "Pending";

  // 3. On-Screen Text Extraction status (Completed ONLY when DB status === completed AND text_extraction exists)
  const rawTextStatus = normalizeStatus(record.text_extraction_status);
  const textSaved = hasSavedTextResult(record);
  const textStatus: OverviewModuleDisplayStatus =
    rawTextStatus === "completed" && textSaved
      ? "Completed"
      : rawTextStatus === "failed"
      ? "Failed"
      : isTextActiveStatus(record.text_extraction_status) || isExtractingText
      ? "Processing"
      : "Pending";

  // 4. Original Reel Script status (Completed ONLY when DB status === completed AND original_script exists)
  const rawScriptStatus = normalizeStatus(record.original_script_status);
  const scriptSaved = hasSavedOriginalScriptResult(record);
  const scriptStatus: OverviewModuleDisplayStatus =
    rawScriptStatus === "completed" && scriptSaved
      ? "Completed"
      : rawScriptStatus === "failed"
      ? "Failed"
      : rawScriptStatus === "processing" ||
        rawScriptStatus === "queued" ||
        isGeneratingScript
      ? "Processing"
      : "Pending";

  const modules: Array<{
    key: "audio" | "visual" | "text" | "script";
    name: string;
    status: OverviewModuleDisplayStatus;
    dbStatusRaw: string;
    hasSavedPayload: boolean;
    detail: string;
    errorDetail: string | null;
    icon: React.ComponentType<{ className?: string }>;
    primaryActionLabel: string;
    onPrimaryAction: () => void;
    secondaryActionLabel?: string;
    onSecondaryAction?: () => void;
    secondaryDisabled?: boolean;
  }> = [
    {
      key: "audio",
      name: "Real Audio Analysis",
      status: audioStatus,
      dbStatusRaw: rawAudioStatus || "pending",
      hasSavedPayload: audioSaved,
      detail:
        audioStatus === "Completed"
          ? `${record.audio_analysis?.timestamped_transcript?.length ?? 0} transcript segments • ${
              record.audio_analysis?.language_detection?.primary_language || "Language detected"
            }`
          : audioStatus === "Processing"
          ? "Running analyze-audio pipeline for this Reel..."
          : audioStatus === "Failed"
          ? "Audio analysis failed. Retry from Audio Analysis."
          : rawAudioStatus === "completed" && !audioSaved
          ? "Status marked completed, but saved audio_analysis payload is missing."
          : "Waiting to run audio transcription and vocal analysis.",
      errorDetail:
        audioStatus === "Failed"
          ? audioAnalysisError || record.audio_analysis_error || "Audio analysis failed."
          : null,
      icon: Volume2,
      primaryActionLabel: "View Real Audio Analysis",
      onPrimaryAction: onViewAudio,
      secondaryActionLabel:
        audioStatus === "Pending"
          ? "Run Audio Analysis"
          : audioStatus === "Failed"
          ? "Retry Audio"
          : undefined,
      onSecondaryAction:
        audioStatus === "Pending" || audioStatus === "Failed"
          ? onAnalyzeAudio
          : undefined,
      secondaryDisabled: isAnalyzingAudio,
    },
    {
      key: "visual",
      name: "Real Visual Analysis",
      status: visualStatus,
      dbStatusRaw: rawVisualStatus || "pending",
      hasSavedPayload: visualSaved,
      detail:
        visualStatus === "Completed"
          ? `${record.visual_analysis?.scenes?.length ?? 0} scenes analyzed${
              record.visual_analysis_gemini_step1?.outfit_changes?.length
                ? ` • ${record.visual_analysis_gemini_step1.outfit_changes.length} outfit looks`
                : ""
            }`
          : visualStatus === "Processing"
          ? "Running sequential Gemini + Groq visual analysis..."
          : visualStatus === "Failed"
          ? "Visual analysis failed. Review error or retry."
          : rawVisualStatus === "completed" && !visualSaved
          ? "Status marked completed, but saved visual_analysis payload is missing."
          : "Waiting to run scene, camera, and look analysis.",
      errorDetail:
        visualStatus === "Failed"
          ? guidedFrameError ||
            visualAnalysisError ||
            record.visual_analysis_error ||
            "Visual analysis failed."
          : null,
      icon: Camera,
      primaryActionLabel: "View Real Visual Analysis",
      onPrimaryAction: onViewVisual,
      secondaryActionLabel:
        visualStatus === "Pending"
          ? "Run Visual Analysis"
          : visualStatus === "Failed"
          ? "Retry Visual"
          : undefined,
      onSecondaryAction:
        visualStatus === "Pending" || visualStatus === "Failed"
          ? onAnalyzeVisual
          : undefined,
      secondaryDisabled: isAnalyzingVisual,
    },
    {
      key: "text",
      name: "On-Screen Text Extraction",
      status: textStatus,
      dbStatusRaw: rawTextStatus || "pending",
      hasSavedPayload: textSaved,
      detail:
        textStatus === "Completed"
          ? `${record.text_extraction?.text_segments?.length ?? 0} on-screen text segments extracted`
          : textStatus === "Processing"
          ? "Extracting visible captions and text overlays..."
          : textStatus === "Failed"
          ? "On-screen text extraction failed."
          : rawTextStatus === "completed" && !textSaved
          ? "Status marked completed, but saved text_extraction payload is missing."
          : "Waiting to extract on-screen text overlays.",
      errorDetail:
        textStatus === "Failed"
          ? textExtractionError ||
            record.text_extraction_error ||
            "On-screen text extraction failed."
          : null,
      icon: Type,
      primaryActionLabel: "View Text Extraction",
      onPrimaryAction: onViewText,
      secondaryActionLabel:
        textStatus === "Pending"
          ? "Extract Text"
          : textStatus === "Failed"
          ? "Retry Text"
          : undefined,
      onSecondaryAction:
        textStatus === "Pending" || textStatus === "Failed" ? onExtractText : undefined,
      secondaryDisabled: isExtractingText,
    },
    {
      key: "script",
      name: "Original Reel Script",
      status: scriptStatus,
      dbStatusRaw: rawScriptStatus || "pending",
      hasSavedPayload: scriptSaved,
      detail:
        scriptStatus === "Completed"
          ? `${record.original_script?.rows?.length ?? 0} synchronized script rows saved`
          : scriptStatus === "Processing"
          ? "Synchronizing Audio, Visual, and Text Extraction evidence..."
          : scriptStatus === "Failed"
          ? "Original Reel Script generation failed."
          : rawScriptStatus === "completed" && !scriptSaved
          ? "Status marked completed, but saved original_script payload is missing."
          : "Waiting for completed source modules and manual generation.",
      errorDetail:
        scriptStatus === "Failed"
          ? originalScriptError ||
            record.original_script_error ||
            "Original Reel Script generation failed."
          : null,
      icon: FileSpreadsheet,
      primaryActionLabel: "View Original Reel Script",
      onPrimaryAction: onViewScript,
    },
  ];

  const sourceModules = modules.slice(0, 3);
  const incompleteSourceModules = sourceModules.filter((m) => m.status !== "Completed");
  const allSourcesCompleted = incompleteSourceModules.length === 0;
  const completedModulesCount = modules.filter((m) => m.status === "Completed").length;

  const isIncompleteSourceError =
    originalScriptErrorCode === "SOURCE_ANALYSES_INCOMPLETE" ||
    Boolean(originalScriptIncompleteSources) ||
    (typeof originalScriptError === "string" &&
      originalScriptError.includes("SOURCE_ANALYSES_INCOMPLETE"));

  const resolvedScriptError =
    originalScriptError ||
    (scriptStatus === "Failed" ? record.original_script_error : null);

  return (
    <div className="space-y-6">
      {/* Top Grid: Selected Reel Player + Overview Pipeline Integration */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Video Preview Player for the selected Reel */}
        <div className="lg:col-span-4 lg:sticky lg:top-6">
          <div className="w-full max-w-sm mx-auto space-y-3">
            <VideoPreviewPlayer
              ref={playerRef}
              src={signedVideoUrl || undefined}
              durationSeconds={record.duration_seconds || 30}
              aspectRatio="9:16"
            />
            <div className="rounded-xl border border-card-border bg-card p-3 text-xs text-text-secondary space-y-1">
              <p className="font-semibold text-text-primary line-clamp-1">
                {record.file_name}
              </p>
              <p className="text-[11px] text-text-muted font-mono truncate">
                Analysis ID: {record.id}
              </p>
              <p className="text-[11px] text-text-muted">
                Click any timestamp in the completed Original Reel Script table below to seek this Reel.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Overview Pipeline Integration & 4 Tracked Modules */}
        <div className="lg:col-span-8 space-y-5">
          {/* Overview Pipeline Integration Header Card */}
          <div className="rounded-2xl border border-card-border bg-card p-5 sm:p-6 shadow-card space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 border-b border-card-border/70 pb-4">
              <div className="flex items-start gap-3">
                <span className="p-2.5 rounded-xl bg-primary/15 text-primary border border-primary/25 shrink-0">
                  <Layers className="h-5 w-5" />
                </span>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base sm:text-lg font-bold text-text-primary">
                      Overview Pipeline Integration
                    </h3>
                    <span className="rounded-full bg-background-elevated px-2.5 py-0.5 text-[11px] font-mono font-semibold text-text-secondary border border-card-border">
                      {completedModulesCount} / 4 Modules Completed
                    </span>
                  </div>
                  <p className="text-xs text-text-secondary leading-relaxed">
                    {scriptStatus === "Completed"
                      ? "All four analysis modules are completed and saved in Supabase for this uploaded Reel."
                      : allSourcesCompleted
                      ? scriptStatus === "Processing"
                        ? "All three source analyses are completed. Original Reel Script is currently processing in the backend."
                        : scriptStatus === "Failed"
                        ? "All three source analyses are completed, but Original Reel Script generation failed. Review the error below to retry."
                        : "Real Audio Analysis, Real Visual Analysis, and On-Screen Text Extraction are completed. You can now generate the Original Reel Script."
                      : `Waiting on ${incompleteSourceModules
                          .map((m) => `${m.name} (${m.status})`)
                          .join(", ")} before generating the Original Reel Script.`}
                  </p>
                </div>
              </div>

              {onRefreshStatus && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onRefreshStatus}
                  disabled={isRefreshing}
                  leftIcon={
                    <RefreshCw
                      className={cn("h-3.5 w-3.5", isRefreshing && "animate-spin")}
                    />
                  }
                  className="shrink-0 self-start"
                >
                  {isRefreshing ? "Refreshing..." : "Refresh"}
                </Button>
              )}
            </div>

            {/* 4 Independently Tracked Module Status Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {modules.map((mod) => {
                const Icon = mod.icon;
                return (
                  <div
                    key={mod.key}
                    className={cn(
                      "rounded-xl border p-4 flex flex-col justify-between gap-3 transition-colors",
                      getCardBorderStyles(mod.status)
                    )}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 text-xs font-bold text-text-primary">
                          <Icon
                            className={cn(
                              "h-4 w-4 shrink-0",
                              mod.status === "Completed"
                                ? "text-success"
                                : mod.status === "Processing"
                                ? "text-primary"
                                : mod.status === "Failed"
                                ? "text-error"
                                : "text-text-muted"
                            )}
                          />
                          <span>{mod.name}</span>
                        </div>

                        <span
                          className={cn(
                            "inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-mono font-semibold border shrink-0",
                            getStatusBadgeStyles(mod.status)
                          )}
                        >
                          {renderStatusIcon(mod.status)}
                          <span>{mod.status}</span>
                        </span>
                      </div>

                      <p className="text-xs text-text-secondary leading-relaxed">
                        {mod.detail}
                      </p>

                      {mod.errorDetail && (
                        <p className="text-[11px] text-error bg-error/10 border border-error/25 rounded-md px-2.5 py-1.5 leading-relaxed">
                          {mod.errorDetail}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-2 border-t border-card-border/50 flex-wrap">
                      <button
                        type="button"
                        onClick={mod.onPrimaryAction}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline cursor-pointer"
                      >
                        <span>{mod.primaryActionLabel}</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>

                      {mod.secondaryActionLabel && mod.onSecondaryAction && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={mod.onSecondaryAction}
                          disabled={mod.secondaryDisabled}
                        >
                          {mod.secondaryActionLabel}
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Primary View Actions Footer (Required View Real Audio / Visual Actions) */}
            <div className="pt-2 border-t border-card-border/70 flex flex-wrap items-center gap-2.5">
              <Button
                variant="outline"
                size="sm"
                onClick={onViewAudio}
                leftIcon={<Volume2 className="h-4 w-4 text-primary" />}
              >
                View Real Audio Analysis
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onViewVisual}
                leftIcon={<Camera className="h-4 w-4 text-primary" />}
              >
                View Real Visual Analysis
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onViewText}
                leftIcon={<Type className="h-4 w-4 text-primary" />}
              >
                View Text Extraction
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onViewScript}
                leftIcon={<FileSpreadsheet className="h-4 w-4 text-primary" />}
              >
                View Original Reel Script
              </Button>
            </div>
          </div>

          {/* Original Reel Script Pipeline Action / Status Card */}
          {scriptStatus === "Processing" && (
            <div className="rounded-2xl border border-primary/30 bg-card p-6 shadow-card space-y-3">
              <div className="flex items-start gap-3.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary shrink-0 border border-primary/25">
                  <Loader2 className="h-5 w-5 animate-spin" />
                </div>
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-sm font-bold text-text-primary">
                      Generating Original Reel Script...
                    </h4>
                    <span className="rounded bg-primary/15 px-2 py-0.5 text-[10px] font-mono font-semibold text-primary border border-primary/30">
                      Processing
                    </span>
                  </div>
                  <p className="text-xs text-text-secondary leading-relaxed">
                    Synchronizing saved Audio Analysis, Visual Analysis, and On-Screen Text Extraction
                    via <code className="font-mono text-primary">generate-original-script</code>.
                  </p>
                  <div className="pt-1 text-[11px] font-mono text-text-muted flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                    <span>Polling database every 5 seconds • Stops automatically on completion or failure</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {scriptStatus !== "Completed" &&
            scriptStatus !== "Processing" &&
            (scriptStatus === "Failed" || isIncompleteSourceError || Boolean(resolvedScriptError)) && (
              <div className="rounded-2xl border border-error/30 bg-card p-6 shadow-card space-y-4">
                <div className="flex items-start gap-3.5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-error/15 text-error shrink-0 border border-error/25">
                    <AlertTriangle className="h-5 w-5" />
                  </div>
                  <div className="space-y-1 flex-1">
                    <h4 className="text-sm font-bold text-text-primary">
                      {isIncompleteSourceError
                        ? "Source Analyses Must Finish First"
                        : "Original Reel Script Generation Failed"}
                    </h4>
                    <p className="text-xs text-error leading-relaxed">
                      {resolvedScriptError ||
                        "The backend encountered an error while generating the Original Reel Script."}
                    </p>
                    {!allSourcesCompleted && (
                      <p className="text-xs text-text-secondary leading-relaxed pt-1">
                        Finish first:{" "}
                        <span className="font-semibold text-text-primary">
                          {incompleteSourceModules
                            .map((m) => `${m.name} (${m.status})`)
                            .join(", ")}
                        </span>
                        .
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 pt-2 border-t border-card-border/70 flex-wrap">
                  {!allSourcesCompleted ? (
                    <div className="flex flex-wrap gap-2">
                      {incompleteSourceModules.map((m) => (
                        <Button
                          key={m.key}
                          variant="outline"
                          size="sm"
                          onClick={() => onSelectTab(m.key)}
                        >
                          Go to {m.name}
                        </Button>
                      ))}
                    </div>
                  ) : (
                    <span className="text-[11px] text-text-muted">
                      Your three completed source analyses remain saved in Supabase.
                    </span>
                  )}

                  <Button
                    variant="primary"
                    size="sm"
                    onClick={onRetryOriginalScript}
                    disabled={isGeneratingScript || !allSourcesCompleted}
                    leftIcon={<RotateCcw className="h-4 w-4" />}
                    className="ml-auto"
                  >
                    Retry Original Reel Script
                  </Button>
                </div>
              </div>
            )}

          {scriptStatus === "Pending" && !isIncompleteSourceError && !resolvedScriptError && (
            <div
              className={cn(
                "rounded-2xl border p-6 shadow-card space-y-4",
                allSourcesCompleted
                  ? "border-primary/30 bg-gradient-to-br from-card to-background-elevated"
                  : "border-warning/30 bg-card"
              )}
            >
              {allSourcesCompleted ? (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-primary shrink-0" />
                      <h4 className="text-sm font-bold text-text-primary">
                        Ready to Generate Original Reel Script
                      </h4>
                    </div>
                    <p className="text-xs text-text-secondary leading-relaxed">
                      Audio Analysis, Visual Analysis, and On-Screen Text Extraction are all completed.
                      Generate the synchronized script table from your saved evidence.
                    </p>
                  </div>

                  <Button
                    variant="primary"
                    size="md"
                    onClick={onGenerateOriginalScript}
                    disabled={isGeneratingScript}
                    leftIcon={<Sparkles className="h-4 w-4" />}
                    className="shadow-glow-primary shrink-0 cursor-pointer"
                  >
                    {isGeneratingScript ? "Starting..." : "Generate Original Reel Script"}
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-text-primary">
                        Complete Source Analyses Before Generating Original Reel Script
                      </h4>
                      <p className="text-xs text-text-secondary leading-relaxed">
                        The following module{incompleteSourceModules.length === 1 ? "" : "s"} must
                        finish first:{" "}
                        <span className="font-semibold text-text-primary">
                          {incompleteSourceModules
                            .map((m) => `${m.name} (${m.status})`)
                            .join(", ")}
                        </span>
                        .
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-1">
                    {incompleteSourceModules.map((m) => (
                      <Button
                        key={m.key}
                        variant="outline"
                        size="sm"
                        onClick={() => onSelectTab(m.key)}
                        rightIcon={<ArrowRight className="h-3.5 w-3.5" />}
                      >
                        {m.status === "Failed"
                          ? `Retry ${m.name}`
                          : m.status === "Processing"
                          ? `View ${m.name}`
                          : `Complete ${m.name}`}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Completed Saved Original Reel Script Synchronized Table (No demo/replacement text) */}
      {scriptStatus === "Completed" && record.original_script && (
        <OriginalScriptTable
          isRealMode={true}
          realData={record.original_script}
          status={record.original_script_status}
          errorMessage={null}
          sourceStatuses={{
            audio: record.audio_analysis_status,
            visual: record.visual_analysis_status,
            text: record.text_extraction_status,
          }}
          sourceAvailability={{
            audio: audioSaved,
            visual: visualSaved,
            text: textSaved,
          }}
          sourceMetadata={{
            audio: record.audio_analysis?.analysis_metadata,
            visual: record.visual_analysis?.analysis_metadata,
            text: record.text_extraction?.analysis_metadata,
          }}
          videoTitle={record.file_name}
          onSeek={onSeek}
          onSelectTab={onSelectTab}
        />
      )}
    </div>
  );
};

export default RealOverviewPipeline;
