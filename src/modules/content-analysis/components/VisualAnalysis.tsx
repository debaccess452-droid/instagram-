import React, { useState } from "react";
import {
  Home,
  User,
  Layers,
  Activity,
  Video,
  Play,
  Copy,
  Check,
  Film,
  Camera,
  Palette,
  AlertTriangle,
  Loader2,
  Sparkles,
  RotateCcw,
  Info,
  Clock,
  Eye,
  ShieldAlert,
} from "lucide-react";
import {
  VisualAnalysisData,
  VisualScene,
  VisualBackendResult,
  VisualAnalysisStatus,
  FramePathItem,
} from "../types/analysis";
import { Button } from "@/components/buttons";
import { cn } from "@/utils/cn";

export interface VisualAnalysisProps {
  data?: VisualAnalysisData; // benchmark demo data fallback
  realData?: VisualBackendResult | null; // real Supabase Edge Function result
  onSeek: (seconds: number) => void;
  isDemoData?: boolean;
  status?: VisualAnalysisStatus | null;
  errorMessage?: string | null;
  onRetry?: () => void;
  onAnalyzeVisual?: () => void;
  isProcessing?: boolean;
  progressStepMessage?: string | null;
  submittedFrames?: FramePathItem[];
  samplingWarning?: string | null;
}

/**
 * Format raw seconds to MM:SS.ms string
 */
function formatSecondsToTimestamp(seconds: number): string {
  if (typeof seconds !== "number" || isNaN(seconds) || seconds < 0) return "00:00.0";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 10);
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}.${ms}`;
}

function formatTimeRange(start: number, end: number): string {
  return `${formatSecondsToTimestamp(start)}–${formatSecondsToTimestamp(end)}`;
}

/**
 * Resolves or synthesizes a clean visual description for demo scenes
 */
function getSceneVisualDescription(scene: VisualScene): string {
  if (scene.visualDescription && scene.visualDescription.trim().length > 0) {
    return scene.visualDescription.trim();
  }

  const framing = scene.cameraFraming
    ? scene.cameraFraming.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
    : "Identifiable framing";

  const parts: string[] = [];

  if (scene.cameraMovement && scene.cameraMovement !== "static") {
    parts.push(`${framing} shot with ${scene.cameraMovement.replace(/-/g, " ")}`);
  } else {
    parts.push(`${framing} shot`);
  }

  if (
    scene.settingAndBackground &&
    !scene.settingAndBackground.toLowerCase().includes("unable to determine")
  ) {
    parts.push(`in ${scene.settingAndBackground.toLowerCase().replace(/^in\s+/, "")}`);
  }

  if (scene.subjectActionsAndGestures) {
    parts.push(`— ${scene.subjectActionsAndGestures}`);
  } else if (scene.subjectDescription) {
    parts.push(`— ${scene.subjectDescription}`);
  }

  if (Array.isArray(scene.objectsAndProps) && scene.objectsAndProps.length > 0) {
    const cleanProps = scene.objectsAndProps.filter(
      (p) => !p.toLowerCase().includes("clone") && !p.toLowerCase().includes("shure")
    );
    if (cleanProps.length > 0) {
      parts.push(`(${cleanProps.slice(0, 2).join(", ")})`);
    }
  }

  return parts.join(" ");
}

export const VisualAnalysis: React.FC<VisualAnalysisProps> = ({
  data,
  realData,
  onSeek,
  isDemoData = false,
  status,
  errorMessage,
  onRetry,
  onAnalyzeVisual,
  isProcessing = false,
  progressStepMessage,
  submittedFrames = [],
  samplingWarning = null,
}) => {
  const [copiedSceneId, setCopiedSceneId] = useState<string | number | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);

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

  // 1. Completed + saved result MUST render immediately (never restart or show loading/stale error)
  const shouldRenderCompletedRealData = Boolean(realData) && isCompletedStatus;

  // 2. Active manual start/retry or active backend queued/processing/groq job
  const showActiveProgress =
    !shouldRenderCompletedRealData &&
    ((isProcessing && Boolean(progressStepMessage)) ||
      (isBackendActiveStatus && !isFailedStatus));

  if (showActiveProgress) {
    const progressLower = (progressStepMessage || "").toLowerCase();
    const activeStageIndex = progressStepMessage
      ? progressLower.includes("queue")
        ? 3
        : progressLower.includes("upload")
        ? 2
        : progressLower.includes("select")
        ? 1
        : 0
      : isQueuedStatus
      ? 3
      : 4;

    const pipelineStages = [
      "Detecting visual changes",
      "Selecting representative frames",
      "Uploading selected frames",
      "Queued",
      "Processing",
    ];

    const activeHeading =
      progressStepMessage ||
      (isGroqFallbackStage
        ? "Processing (Groq fallback analyzing selected frames)..."
        : isQueuedStatus
        ? "Queued for visual analysis..."
        : "Processing visual analysis...");

    const activeDescription = progressStepMessage
      ? "Running adaptive, scene-aware frame sampling across your uploaded Reel before queueing backend analysis."
      : isGroqFallbackStage
      ? "Using the adaptively selected representative frames to analyze visible scenes, subjects, and on-screen details."
      : isQueuedStatus
      ? "Your Reel visual analysis job is queued in the background. Monitoring existing job status..."
      : "Observing scenes, camera framing, visible subjects, and visual composition from your uploaded Reel.";

    const activeFooterLabel = progressStepMessage
      ? "Analyzing video progressively in browser"
      : isGroqFallbackStage
      ? "Groq fallback processing • Checking status every 5 seconds"
      : isQueuedStatus
      ? "Queued • Checking status every 5 seconds"
      : "Processing • Checking status every 5 seconds";

    return (
      <div className="rounded-2xl border border-primary/30 bg-card p-8 sm:p-12 shadow-card text-center space-y-5">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 text-primary mx-auto">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
        <div className="max-w-lg mx-auto space-y-2">
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

          {/* 5-Stage Pipeline Progress */}
          <div className="pt-3 flex flex-wrap items-center justify-center gap-1.5">
            {pipelineStages.map((stageLabel, idx) => {
              const isDone = idx < activeStageIndex;
              const isCurrent = idx === activeStageIndex;
              return (
                <span
                  key={stageLabel}
                  className={cn(
                    "rounded-md px-2 py-1 text-[10px] font-mono border transition-colors",
                    isCurrent
                      ? "bg-primary/15 text-primary border-primary/40 font-semibold"
                      : isDone
                      ? "bg-success/10 text-success border-success/25"
                      : "bg-background-elevated text-text-muted border-card-border"
                  )}
                >
                  {idx + 1}. {stageLabel}
                </span>
              );
            })}
          </div>

          {!progressStepMessage && submittedFrames.length > 0 && (
            <div className="pt-3 mt-2 border-t border-card-border/60 space-y-2">
              <p className="text-[11px] font-semibold text-text-secondary">
                {submittedFrames.length} adaptive representative{" "}
                {submittedFrames.length === 1 ? "frame" : "frames"} uploaded & submitted
              </p>
              {samplingWarning && (
                <p className="text-[11px] text-warning bg-warning/10 border border-warning/25 rounded-md px-3 py-1.5 text-left">
                  {samplingWarning}
                </p>
              )}
              <div className="flex flex-wrap items-center justify-center gap-1.5">
                {submittedFrames.map((f, idx) => (
                  <span
                    key={`${f.path}-${idx}`}
                    className="rounded bg-background-elevated px-2 py-0.5 font-mono text-[10px] text-text-muted border border-card-border"
                  >
                    #{idx + 1} · {formatSecondsToTimestamp(f.timestamp_seconds)}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // 3. Failed State with Retry Action
  if (!shouldRenderCompletedRealData && (isFailedStatus || (!realData && Boolean(errorMessage)))) {
    return (
      <div className="rounded-2xl border border-error/30 bg-card p-6 sm:p-8 shadow-card space-y-4">
        <div className="flex items-start gap-3.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-error/15 text-error shrink-0 border border-error/25">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div className="space-y-1 flex-1">
            <h3 className="text-base font-bold text-text-primary">
              Visual Analysis Failed
            </h3>
            <p className="text-xs text-error leading-relaxed">
              {errorMessage || "The backend encountered an error while processing visuals from your Reel."}
            </p>
            <p className="text-[11px] text-text-muted mt-1">
              Your uploaded Reel is securely saved in storage. You do not need to re-upload your video to retry analysis.
            </p>
          </div>
        </div>

        {onRetry && (
          <div className="flex justify-end pt-2 border-t border-card-border/80">
            <Button
              variant="primary"
              size="sm"
              onClick={onRetry}
              leftIcon={<RotateCcw className="h-4 w-4" />}
            >
              Retry Visual Analysis
            </Button>
          </div>
        )}
      </div>
    );
  }

  // 4. Pending / Not Analyzed State (manual start only — never auto-starts on reopen)
  if (!realData && !data && (normalizedStatus === "pending" || !normalizedStatus)) {
    return (
      <div className="rounded-2xl border border-card-border bg-card p-8 sm:p-10 shadow-card text-center space-y-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 text-primary mx-auto">
          <Sparkles className="h-8 w-8" />
        </div>
        <div className="max-w-md mx-auto space-y-2">
          <h3 className="text-lg font-bold text-text-primary">
            Ready for Visual Intelligence
          </h3>
          <p className="text-xs text-text-secondary leading-relaxed">
            Your Reel is stored in private Supabase Storage. Run the Visual Analysis pipeline
            (Gemini primary full-video analysis, with adaptive scene-aware frame sampling up to a
            30-frame safety ceiling for Groq fallback readiness)
            to observe scenes, camera framing, subject actions, lighting, and visual composition.
          </p>
        </div>
        {onAnalyzeVisual && (
          <div className="pt-2">
            <Button
              variant="primary"
              size="lg"
              onClick={onAnalyzeVisual}
              leftIcon={<Sparkles className="h-5 w-5" />}
              className="shadow-glow-primary py-3 px-6 cursor-pointer"
            >
              Analyze Visuals
            </Button>
          </div>
        )}
      </div>
    );
  }

  // 5. Edge case: status is completed in DB but visual_analysis payload is empty
  if (isCompletedStatus && !realData && !data) {
    return (
      <div className="rounded-2xl border border-card-border bg-card p-6 sm:p-8 shadow-card space-y-4">
        <div className="flex items-start gap-3.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-warning/15 text-warning shrink-0 border border-warning/25">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div className="space-y-1 flex-1">
            <h3 className="text-base font-bold text-text-primary">
              Visual Analysis Result Unavailable
            </h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              This analysis record is marked as completed, but no visual analysis payload was saved.
            </p>
          </div>
        </div>
        {onRetry && (
          <div className="flex justify-end pt-2 border-t border-card-border/80">
            <Button
              variant="primary"
              size="sm"
              onClick={onRetry}
              leftIcon={<RotateCcw className="h-4 w-4" />}
            >
              Retry Visual Analysis
            </Button>
          </div>
        )}
      </div>
    );
  }

  // =========================================================================
  // 6. REAL BACKEND DATA RENDERING (VisualBackendResult)
  // =========================================================================
  if (realData) {
    const overview = realData.video_overview;
    const scenes = [...(realData.scenes || [])].sort(
      (a, b) => (a.start_time_seconds ?? 0) - (b.start_time_seconds ?? 0)
    );
    const metadata = realData.analysis_metadata || { warnings: [] };

    // Unique framings & movements observed
    const observedFramings = Array.from(
      new Set(scenes.map((s) => s.camera?.shot_framing).filter(Boolean))
    );
    const observedAngles = Array.from(
      new Set(scenes.map((s) => s.camera?.camera_angle).filter(Boolean))
    );
    const observedMovements = Array.from(
      new Set(scenes.map((s) => s.camera?.camera_movement).filter(Boolean))
    );

    // Dominant colors aggregated across scenes
    const allColours = Array.from(
      new Set(
        scenes.flatMap((s) => s.composition?.dominant_colours || []).filter(Boolean)
      )
    );

    const handleCopyAllScenes = () => {
      const summaryText = scenes
        .map(
          (s) =>
            `[Scene ${s.scene_number}] ${formatTimeRange(
              s.start_time_seconds,
              s.end_time_seconds
            )}: ${s.scene_description}`
        )
        .join("\n");
      navigator.clipboard.writeText(summaryText);
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 2000);
    };

    const handleCopyRow = (id: string | number, text: string) => {
      navigator.clipboard.writeText(text);
      setCopiedSceneId(id);
      setTimeout(() => setCopiedSceneId(null), 1800);
    };

    const providerIdentityText = [metadata.provider, metadata.source, metadata.model]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    const isGroqFallbackResult =
      Boolean(metadata.fallback_used) ||
      providerIdentityText.includes("groq") ||
      providerIdentityText.includes("qwen") ||
      providerIdentityText.includes("fallback");

    const backendFrameItems: FramePathItem[] = Array.isArray(metadata.submitted_frames)
      ? metadata.submitted_frames
      : Array.isArray(metadata.frame_paths)
      ? metadata.frame_paths
      : Array.isArray(metadata.frame_timestamps)
      ? metadata.frame_timestamps
          .filter((ts) => typeof ts === "number" && Number.isFinite(ts))
          .map((ts, i) => ({
            path: `frame-${i + 1}.jpg`,
            timestamp_seconds: ts,
          }))
      : [];

    const resolvedSubmittedFrames = (
      backendFrameItems.length > 0 ? backendFrameItems : submittedFrames || []
    )
      .slice()
      .sort((a, b) => a.timestamp_seconds - b.timestamp_seconds);

    const resolvedFrameCount =
      resolvedSubmittedFrames.length > 0
        ? resolvedSubmittedFrames.length
        : typeof metadata.frame_count === "number" && metadata.frame_count > 0
        ? metadata.frame_count
        : typeof metadata.frames_submitted === "number" && metadata.frames_submitted > 0
        ? metadata.frames_submitted
        : 0;

    const resolvedSamplingWarning =
      samplingWarning ||
      metadata.sampling_warning ||
      (metadata.sampling_limit_reached || resolvedFrameCount >= 30
        ? "Reached the 30-frame safety ceiling; prioritized the most visually distinct moments. Some rapid cuts or intermediate visual moments may not be sampled."
        : null);

    return (
      <div className="space-y-6">
        {/* Real Backend Evidence Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 rounded-xl bg-primary/10 border border-primary/25 px-4 py-3 text-xs shadow-sm">
          <div className="flex items-center gap-2.5 text-text-secondary">
            <span
              className={cn(
                "inline-block h-2.5 w-2.5 rounded-full shrink-0",
                isGroqFallbackResult ? "bg-warning" : "bg-success"
              )}
            />
            <span className="font-semibold text-text-primary">
              {isGroqFallbackResult
                ? "Fallback visual analysis completed (representative frames only)."
                : "Visual analysis completed."}
            </span>
            <span className="hidden sm:inline text-text-muted">
              {isGroqFallbackResult
                ? "— Groq fallback analyzed submitted representative frames only"
                : "— Gemini primary full-video observation"}
              {metadata.model ? ` (${metadata.model})` : ""}
            </span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {resolvedFrameCount > 0 && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-background-elevated text-text-secondary border border-card-border font-semibold">
                {resolvedFrameCount} {resolvedFrameCount === 1 ? "Frame" : "Frames"} Selected
              </span>
            )}
            {resolvedSamplingWarning && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-warning/15 text-warning border border-warning/30 font-semibold">
                30-Frame Ceiling Reached
              </span>
            )}
            {isGroqFallbackResult ? (
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-warning/15 text-warning border border-warning/30 font-semibold">
                Groq Fallback • Frames Only
              </span>
            ) : typeof metadata.frame_sampling_fps === "number" &&
              metadata.frame_sampling_fps > 0 ? (
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-primary/15 text-primary border border-primary/25 font-semibold">
                Sampled at {metadata.frame_sampling_fps} FPS
              </span>
            ) : metadata.model ? (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-primary/15 text-primary border border-primary/25 font-semibold">
                {metadata.model}
              </span>
            ) : null}
            <Button
              variant="secondary"
              size="sm"
              onClick={handleCopyAllScenes}
              leftIcon={
                copiedAll ? (
                  <Check className="h-3.5 w-3.5 text-success" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )
              }
            >
              {copiedAll ? "Copied All" : "Copy Breakdown"}
            </Button>
          </div>
        </div>

        {/* =================================================================== */}
        {/* SECTION 1: Video Overview                                           */}
        {/* =================================================================== */}
        <div className="rounded-xl border border-card-border bg-card p-5 space-y-4 shadow-card">
          <div className="flex items-center gap-2.5 border-b border-card-border/60 pb-3">
            <span className="p-2 rounded-lg bg-primary/15 text-primary border border-primary/25">
              <Eye className="h-4 w-4" />
            </span>
            <div>
              <h3 className="text-sm font-bold text-text-primary">
                1. Video Overview
              </h3>
              <p className="text-[11px] text-text-muted">
                Synthesized visual summary and observable duration pacing
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-lg bg-background-elevated/70 p-4 border border-card-border space-y-1.5">
              <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider block">
                Visible Summary:
              </span>
              <p className="text-xs leading-relaxed text-text-primary">
                {overview?.summary || "Direct visual summary generated from sampled video frames."}
              </p>
            </div>

            <div className="rounded-lg bg-background-elevated/70 p-4 border border-card-border space-y-1.5">
              <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider block">
                Duration & Pacing Observation:
              </span>
              <p className="text-xs leading-relaxed text-text-secondary">
                {overview?.duration_observation || "Duration observation based on visual cut tempo."}
              </p>
            </div>
          </div>
        </div>

        {/* =================================================================== */}
        {/* SECTION 2: Scene-by-Scene Analysis                                  */}
        {/* =================================================================== */}
        <div className="rounded-xl border border-card-border bg-card p-5 space-y-4 shadow-card">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-card-border/80 pb-3">
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-lg bg-primary/15 text-primary border border-primary/25">
                <Film className="h-4 w-4" />
              </span>
              <div>
                <h3 className="text-sm font-bold text-text-primary">
                  2. Scene-by-Scene Analysis ({scenes.length} {scenes.length === 1 ? "Scene" : "Scenes"})
                </h3>
                <p className="text-[11px] text-text-muted">
                  Detailed chronological observation of each shot boundary
                </p>
              </div>
            </div>
          </div>

          {scenes.length > 0 ? (
            <div className="space-y-4">
              {scenes.map((scene) => (
                <div
                  key={scene.scene_number}
                  className="rounded-xl border border-card-border bg-background-elevated/40 p-4 space-y-3 hover:border-primary/40 transition-colors"
                >
                  {/* Scene Header */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-card-border/60 pb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-primary/20 text-primary border border-primary/30">
                        Scene {scene.scene_number}
                      </span>
                      <button
                        type="button"
                        onClick={() => onSeek(scene.start_time_seconds)}
                        className="inline-flex items-center gap-1.5 rounded bg-primary/10 hover:bg-primary/20 text-primary border border-primary/25 px-2.5 py-0.5 font-mono text-xs font-semibold transition-colors cursor-pointer"
                        title="Seek video to start of scene"
                      >
                        <Play className="h-3 w-3 fill-current" />
                        <span>{formatTimeRange(scene.start_time_seconds, scene.end_time_seconds)}</span>
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleCopyRow(scene.scene_number, scene.scene_description)}
                      className="p-1 rounded text-text-muted hover:text-text-primary hover:bg-background-elevated transition-colors"
                      title="Copy scene description"
                    >
                      {copiedSceneId === scene.scene_number ? (
                        <Check className="h-3.5 w-3.5 text-success" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>

                  {/* Scene Description */}
                  <p className="text-xs leading-relaxed text-text-primary font-medium">
                    {scene.scene_description || "Not clearly visible"}
                  </p>

                  {/* Detailed Specs Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-[11px] pt-1">
                    {/* Visible Subjects */}
                    <div className="rounded-lg bg-card/80 p-2.5 border border-card-border/80 space-y-1">
                      <div className="flex items-center gap-1.5 text-text-muted font-semibold uppercase tracking-wider text-[10px]">
                        <User className="h-3 w-3 text-primary" />
                        <span>Visible Subjects:</span>
                      </div>
                      {scene.visible_subjects && scene.visible_subjects.length > 0 ? (
                        scene.visible_subjects.map((subj, sIdx) => (
                          <div key={sIdx} className="space-y-0.5 text-text-secondary">
                            <span className="font-semibold text-text-primary">{subj.subject_label}: </span>
                            <span>{subj.visible_action || "Observed in frame"}</span>
                            {subj.clothing && (
                              <p className="text-[10px] text-text-muted">
                                Clothing: {subj.clothing}
                              </p>
                            )}
                          </div>
                        ))
                      ) : (
                        <p className="text-text-muted italic">No distinct subjects identified</p>
                      )}
                    </div>

                    {/* Environment & Objects */}
                    <div className="rounded-lg bg-card/80 p-2.5 border border-card-border/80 space-y-1">
                      <div className="flex items-center gap-1.5 text-text-muted font-semibold uppercase tracking-wider text-[10px]">
                        <Home className="h-3 w-3 text-primary" />
                        <span>Setting & Objects:</span>
                      </div>
                      <p className="text-text-secondary">
                        <span className="text-text-muted">Setting: </span>
                        {scene.environment?.setting || "Not clearly visible"}
                      </p>
                      {scene.environment?.visible_objects && scene.environment.visible_objects.length > 0 && (
                        <p className="text-[10px] text-text-muted line-clamp-2">
                          Objects: {scene.environment.visible_objects.join(", ")}
                        </p>
                      )}
                    </div>

                    {/* Camera & Framing */}
                    <div className="rounded-lg bg-card/80 p-2.5 border border-card-border/80 space-y-1">
                      <div className="flex items-center gap-1.5 text-text-muted font-semibold uppercase tracking-wider text-[10px]">
                        <Camera className="h-3 w-3 text-primary" />
                        <span>Camera & Angle:</span>
                      </div>
                      <p className="text-text-secondary">
                        {scene.camera?.shot_framing || "Framing not specified"} • {scene.camera?.camera_angle || "Angle not specified"}
                      </p>
                      <p className="text-[10px] text-text-muted">
                        Movement: {scene.camera?.camera_movement || "Static"}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-text-muted italic">
              No distinct scene cuts identified in the sampled frames.
            </p>
          )}
        </div>

        {/* =================================================================== */}
        {/* SECTION 3: Camera and Framing Breakdown                             */}
        {/* =================================================================== */}
        <div className="rounded-xl border border-card-border bg-card p-5 space-y-4 shadow-card">
          <div className="flex items-center gap-2.5 border-b border-card-border/60 pb-3">
            <span className="p-2 rounded-lg bg-primary/15 text-primary border border-primary/25">
              <Video className="h-4 w-4" />
            </span>
            <div>
              <h3 className="text-sm font-bold text-text-primary">
                3. Camera and Framing Breakdown
              </h3>
              <p className="text-[11px] text-text-muted">
                Observed shot scales, camera angles, and observable camera movements
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="rounded-lg bg-background-elevated/70 p-3.5 border border-card-border space-y-1.5">
              <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider block">
                Observed Shot Framing:
              </span>
              <p className="text-text-primary font-semibold">
                {observedFramings.length > 0 ? observedFramings.join(", ") : "Not clearly specified"}
              </p>
              <p className="text-[11px] text-text-muted pt-1">
                Framing scale directly identified from visual boundaries in sampled frames.
              </p>
            </div>

            <div className="rounded-lg bg-background-elevated/70 p-3.5 border border-card-border space-y-1.5">
              <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider block">
                Observed Camera Angles:
              </span>
              <p className="text-text-primary font-semibold">
                {observedAngles.length > 0 ? observedAngles.join(", ") : "Not clearly specified"}
              </p>
              <p className="text-[11px] text-text-muted pt-1">
                Camera perspective angle relative to the primary subject.
              </p>
            </div>

            <div className="rounded-lg bg-background-elevated/70 p-3.5 border border-card-border space-y-1.5">
              <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider block">
                Observable Camera Movement:
              </span>
              <p className="text-text-primary font-semibold">
                {observedMovements.length > 0
                  ? observedMovements.join(", ")
                  : "Not clearly specified"}
              </p>
              <p className="text-[11px] text-text-muted pt-1">
                Camera dynamics observed between consecutive sampled frames.
              </p>
            </div>
          </div>
        </div>

        {/* =================================================================== */}
        {/* SECTION 4: Visual Composition & Palette                             */}
        {/* =================================================================== */}
        <div className="rounded-xl border border-card-border bg-card p-5 space-y-4 shadow-card">
          <div className="flex items-center gap-2.5 border-b border-card-border/60 pb-3">
            <span className="p-2 rounded-lg bg-primary/15 text-primary border border-primary/25">
              <Palette className="h-4 w-4" />
            </span>
            <div>
              <h3 className="text-sm font-bold text-text-primary">
                4. Visual Composition & Palette
              </h3>
              <p className="text-[11px] text-text-muted">
                Dominant color tones, subject placement, and lighting appearance
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Dominant Colours */}
            <div className="rounded-lg bg-background-elevated/70 p-3.5 border border-card-border space-y-2">
              <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider block">
                Dominant Color Tones:
              </span>
              {allColours.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {allColours.map((col, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 rounded-md bg-card px-2.5 py-1 text-xs font-medium text-text-primary border border-card-border shadow-xs"
                    >
                      <span className="h-2 w-2 rounded-full bg-primary" />
                      <span>{col}</span>
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-text-muted italic text-[11px]">No dominant colors extracted</p>
              )}
            </div>

            {/* Lighting & Contrast */}
            <div className="rounded-lg bg-background-elevated/70 p-3.5 border border-card-border space-y-1.5">
              <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider block">
                Visible Contrast & Lighting Appearance:
              </span>
              <p className="text-text-primary leading-relaxed">
                {scenes.find((s) => s.composition?.contrast_and_lighting_appearance)?.composition
                  ?.contrast_and_lighting_appearance ||
                  "Contrast and lighting appearance not separately specified in sampled frames."}
              </p>
            </div>
          </div>
        </div>

        {/* =================================================================== */}
        {/* SECTION 5: Analysis Warnings & Methodology Notice                   */}
        {/* =================================================================== */}
        <div className="rounded-xl border border-card-border bg-card p-5 space-y-4 shadow-card">
          <div className="flex items-center gap-2 text-xs font-semibold text-text-primary">
            <Info className="h-4 w-4 text-primary" />
            <span>Methodology, Provider Scope & Sampling Limitations</span>
          </div>

          {/* Submitted Frames & Timestamps */}
          {(resolvedFrameCount > 0 || resolvedSubmittedFrames.length > 0) && (
            <div className="rounded-lg bg-background-elevated/70 p-3.5 border border-card-border space-y-2">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">
                  Adaptively Selected Frames ({resolvedFrameCount} selected · max 30 safety ceiling)
                </span>
                <span className="text-[11px] font-mono text-text-muted">
                  Click any timestamp to seek video
                </span>
              </div>
              {resolvedSubmittedFrames.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {resolvedSubmittedFrames.map((frame, idx) => (
                    <button
                      key={`${frame.path}-${idx}`}
                      type="button"
                      onClick={() => onSeek(frame.timestamp_seconds)}
                      className="inline-flex items-center gap-1 rounded bg-primary/10 hover:bg-primary/20 text-primary border border-primary/25 px-2 py-0.5 font-mono text-[11px] font-semibold transition-colors cursor-pointer"
                      title={`Seek to Frame #${idx + 1} (${frame.timestamp_seconds}s)`}
                    >
                      <Play className="h-2.5 w-2.5 fill-current" />
                      <span>
                        Frame {idx + 1} · {formatSecondsToTimestamp(frame.timestamp_seconds)} ({frame.timestamp_seconds.toFixed(2)}s)
                      </span>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-text-secondary">
                  {resolvedFrameCount} adaptive representative{" "}
                  {resolvedFrameCount === 1 ? "frame was" : "frames were"} selected and submitted for visual fallback coverage.
                </p>
              )}
            </div>
          )}

          {resolvedSamplingWarning && (
            <div className="rounded-lg bg-warning/10 border border-warning/30 p-3.5 text-xs text-text-primary flex items-start gap-2.5">
              <AlertTriangle className="h-4 w-4 text-warning shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <span className="font-semibold text-warning block">
                  Sampling Ceiling Reached (30 Frames)
                </span>
                <p className="text-text-secondary leading-relaxed">
                  {resolvedSamplingWarning}
                </p>
              </div>
            </div>
          )}

          <div className="rounded-lg bg-background-elevated/60 p-3.5 text-xs leading-relaxed text-text-secondary border border-card-border space-y-2">
            <p>
              <strong className="text-text-primary">Provider Scope: </strong>
              Gemini remains the primary full-video analysis provider. Groq serves as a fallback provider that analyzes only the adaptively selected representative frames (up to the 30-frame safety ceiling) and is never a complete full-video analysis.
            </p>
            <p>
              <strong className="text-text-primary">Adaptive Sampling Limitation: </strong>
              {isGroqFallbackResult
                ? "This result was produced by Groq fallback from the submitted representative frames only. "
                : typeof metadata.frame_sampling_fps === "number" &&
                  metadata.frame_sampling_fps > 0
                ? `Primary visual analysis sampled the video at ${metadata.frame_sampling_fps} FPS. `
                : ""}
              Adaptive sampling targets visual changes (scene cuts, outfit/background shifts, framing changes, and text overlays) rather than capturing every video frame; rapid flashes or brief events between sampled timestamps may not be captured.
            </p>
            <p className="text-[11px] text-text-muted">
              Evidence & accuracy policy: Scene timestamps remain chronological and events between unsampled frames are not fabricated. Technical camera hardware, lens specs, lighting gear, and unidentifiable people are never invented.
            </p>
          </div>

          {metadata.warnings && metadata.warnings.length > 0 && (
            <div className="space-y-1.5 pt-1">
              <span className="text-[10px] font-semibold text-warning uppercase tracking-wider block">
                Backend Observations:
              </span>
              <ul className="space-y-1 text-xs text-text-secondary">
                {metadata.warnings.map((w, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <AlertTriangle className="h-3.5 w-3.5 text-warning shrink-0 mt-0.5" />
                    <span>{w}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    );
  }

  // =========================================================================
  // 5. DEMO PRESET FALLBACK RENDERING (PRESERVED IN FULL)
  // =========================================================================
  const scenes = data?.scenes || [];
  const firstScene = scenes[0];
  const primarySetting =
    firstScene?.settingAndBackground ||
    "Indoor creator studio setting with acoustic slat wall panels and dark matte shelving.";

  const backgroundChanges: Array<{ timestamp: string; seconds: number; change: string }> = [];
  scenes.forEach((sc, idx) => {
    if (idx === 0) return;
    const prev = scenes[idx - 1];
    if (
      sc.settingAndBackground &&
      prev.settingAndBackground &&
      sc.settingAndBackground.trim() !== prev.settingAndBackground.trim()
    ) {
      backgroundChanges.push({
        timestamp: sc.timestamp,
        seconds: sc.startTime,
        change: sc.settingAndBackground,
      });
    }
  });

  const subjectDesc =
    firstScene?.subjectDescription ||
    "Single visible presenter in late 20s, centered in frame.";
  const clothingDesc =
    firstScene?.clothingAndAppearance ||
    "Charcoal washed cotton crewneck sweatshirt, minimal dark wristwatch on left wrist.";

  const outfitChanged = scenes.some(
    (sc) =>
      sc.clothingAndAppearance &&
      firstScene?.clothingAndAppearance &&
      sc.clothingAndAppearance.toLowerCase() !==
        firstScene.clothingAndAppearance.toLowerCase()
  );

  const outfitStatus = outfitChanged
    ? "Wardrobe variation detected across scenes."
    : "No outfit changes detected throughout the video. The subject wears the same charcoal crewneck sweatshirt in all scenes.";

  const objectChanges: Array<{ timestamp: string; seconds: number; description: string }> = [];
  scenes.forEach((sc) => {
    if (Array.isArray(sc.objectsAndProps) && sc.objectsAndProps.length > 0) {
      const cleanProps = sc.objectsAndProps.filter(
        (p) => !p.toLowerCase().includes("clone") && !p.toLowerCase().includes("shure")
      );
      if (cleanProps.length > 0) {
        objectChanges.push({
          timestamp: sc.timestamp,
          seconds: sc.startTime,
          description: cleanProps.join(", "),
        });
      }
    }
  });

  const gestureItems = scenes
    .filter((sc) => sc.subjectActionsAndGestures && sc.subjectActionsAndGestures.trim())
    .map((sc) => ({
      timestamp: sc.timestamp,
      seconds: sc.startTime,
      action: sc.subjectActionsAndGestures,
    }));

  const observedFramings = Array.from(
    new Set(
      scenes
        .map((sc) => sc.cameraFraming)
        .filter(Boolean)
        .map((f) => f.replace(/-/g, " "))
    )
  ).join(", ");

  const observedMovements = Array.from(
    new Set(
      scenes
        .map((sc) => sc.cameraMovement)
        .filter(Boolean)
        .map((m) => m.replace(/-/g, " "))
    )
  ).join(", ");

  const handleCopyAllBreakdown = () => {
    const tableText = scenes
      .map((sc) => `[${sc.timestamp}] ${getSceneVisualDescription(sc)}`)
      .join("\n");
    navigator.clipboard.writeText(tableText);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  const handleCopyRow = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSceneId(id);
    setTimeout(() => setCopiedSceneId(null), 1800);
  };

  return (
    <div className="space-y-6">
      {/* Demo Mode Notice */}
      {isDemoData && (
        <div className="flex items-center justify-between rounded-xl bg-primary/5 border border-primary/20 px-4 py-2.5 text-xs shadow-sm">
          <div className="flex items-center gap-2.5 text-text-secondary">
            <span className="inline-block h-2 w-2 rounded-full bg-primary animate-pulse" />
            <span className="font-semibold text-text-primary">Demo Analysis Mode</span>
            <span className="hidden sm:inline text-text-muted">
              — Displaying benchmark Reel video frame visual analysis
            </span>
          </div>
          <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-primary/15 text-primary border border-primary/25 font-semibold">
            Reference Sample
          </span>
        </div>
      )}

      {/* Components 1 to 4 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Component 1: Setting and Background */}
        <div className="rounded-xl border border-card-border bg-card p-5 space-y-3.5 shadow-card">
          <div className="flex items-center justify-between border-b border-card-border/60 pb-3">
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-lg bg-primary/15 text-primary border border-primary/25">
                <Home className="h-4 w-4" />
              </span>
              <div>
                <h3 className="text-sm font-bold text-text-primary">
                  1. Setting and Background
                </h3>
                <p className="text-[11px] text-text-muted">
                  Identifiable surroundings and environmental changes
                </p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1 rounded bg-success/15 px-2 py-0.5 text-[10px] font-semibold text-success border border-success/20">
              <Check className="h-3 w-3" />
              Verified
            </span>
          </div>

          <div className="space-y-2.5 text-xs leading-relaxed text-text-secondary">
            <div>
              <span className="text-text-muted font-medium">Visible Environment: </span>
              <span className="text-text-primary font-medium">{primarySetting}</span>
            </div>

            <div>
              <span className="text-text-muted font-medium">Setting Type: </span>
              <span className="text-text-primary font-medium">
                Indoor studio room (acoustic wall slats, wooden desk, matte black shelving).
              </span>
            </div>

            {backgroundChanges.length > 0 ? (
              <div className="pt-1.5 border-t border-card-border/60 space-y-1.5">
                <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider block">
                  Noticeable Background Changes:
                </span>
                <ul className="space-y-1 text-[11px]">
                  {backgroundChanges.map((change, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <button
                        type="button"
                        onClick={() => onSeek(change.seconds)}
                        className="font-mono text-primary hover:underline font-semibold shrink-0 cursor-pointer"
                        title="Seek video"
                      >
                        {change.timestamp}
                      </button>
                      <span className="text-text-muted">—</span>
                      <span className="text-text-primary">{change.change}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="text-[11px] text-text-muted italic pt-1">
                Background environment remains static throughout all scenes.
              </p>
            )}
          </div>
        </div>

        {/* Component 2: Subject Appearance */}
        <div className="rounded-xl border border-card-border bg-card p-5 space-y-3.5 shadow-card">
          <div className="flex items-center justify-between border-b border-card-border/60 pb-3">
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-lg bg-primary/15 text-primary border border-primary/25">
                <User className="h-4 w-4" />
              </span>
              <div>
                <h3 className="text-sm font-bold text-text-primary">
                  2. Subject Appearance
                </h3>
                <p className="text-[11px] text-text-muted">
                  Visible presenter, clothing, and frame presence
                </p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1 rounded bg-success/15 px-2 py-0.5 text-[10px] font-semibold text-success border border-success/20">
              <Check className="h-3 w-3" />
              Verified
            </span>
          </div>

          <div className="space-y-2.5 text-xs leading-relaxed text-text-secondary">
            <div>
              <span className="text-text-muted font-medium">General Appearance: </span>
              <span className="text-text-primary font-medium">{subjectDesc}</span>
            </div>

            <div>
              <span className="text-text-muted font-medium">Visible Clothing & Accessories: </span>
              <span className="text-text-primary font-medium">{clothingDesc}</span>
            </div>

            <div>
              <span className="text-text-muted font-medium">Hair & Features: </span>
              <span className="text-text-primary font-medium">
                Short dark hair, clean-shaven appearance; no hats or headwear visible.
              </span>
            </div>

            <div>
              <span className="text-text-muted font-medium">Position & Frame Presence: </span>
              <span className="text-text-primary font-medium">
                Maintains central vertical alignment; eyeline remains fixed in the upper-third guideline across all cuts.
              </span>
            </div>
          </div>
        </div>

        {/* Component 3: Outfit and Object Changes */}
        <div className="rounded-xl border border-card-border bg-card p-5 space-y-3.5 shadow-card">
          <div className="flex items-center justify-between border-b border-card-border/60 pb-3">
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-lg bg-primary/15 text-primary border border-primary/25">
                <Layers className="h-4 w-4" />
              </span>
              <div>
                <h3 className="text-sm font-bold text-text-primary">
                  3. Outfit and Object Changes
                </h3>
                <p className="text-[11px] text-text-muted">
                  Wardrobe tracking and object shifts throughout the Reel
                </p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1 rounded bg-success/15 px-2 py-0.5 text-[10px] font-semibold text-success border border-success/20">
              <Check className="h-3 w-3" />
              Verified
            </span>
          </div>

          <div className="space-y-2.5 text-xs leading-relaxed text-text-secondary">
            <div className="rounded-lg bg-background-elevated/70 p-3 border border-card-border">
              <span className="text-text-muted font-semibold block text-[11px] uppercase tracking-wider mb-1">
                Outfit Changes:
              </span>
              <p className="text-text-primary">{outfitStatus}</p>
            </div>

            <div className="pt-1 space-y-1.5">
              <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider block">
                Visible Object & Prop Movements:
              </span>
              {objectChanges.length > 0 ? (
                <ul className="space-y-1.5 text-[11px]">
                  {objectChanges.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <button
                        type="button"
                        onClick={() => onSeek(item.seconds)}
                        className="font-mono text-primary hover:underline font-semibold shrink-0 cursor-pointer"
                        title="Seek video"
                      >
                        {item.timestamp}
                      </button>
                      <span className="text-text-muted">—</span>
                      <span className="text-text-primary">{item.description}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-[11px] text-text-muted italic">
                  No object or prop position changes detected.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Component 4: Body Movements and Gestures */}
        <div className="rounded-xl border border-card-border bg-card p-5 space-y-3.5 shadow-card">
          <div className="flex items-center justify-between border-b border-card-border/60 pb-3">
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-lg bg-primary/15 text-primary border border-primary/25">
                <Activity className="h-4 w-4" />
              </span>
              <div>
                <h3 className="text-sm font-bold text-text-primary">
                  4. Body Movements and Gestures
                </h3>
                <p className="text-[11px] text-text-muted">
                  Observable visible actions, hand gestures, and expressions
                </p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1 rounded bg-success/15 px-2 py-0.5 text-[10px] font-semibold text-success border border-success/20">
              <Check className="h-3 w-3" />
              Verified
            </span>
          </div>

          <div className="space-y-2 text-xs max-h-56 overflow-y-auto pr-1">
            {gestureItems.length > 0 ? (
              <ul className="space-y-2 text-[11px]">
                {gestureItems.map((item, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2 pb-1.5 border-b border-card-border/40 last:border-0"
                  >
                    <button
                      type="button"
                      onClick={() => onSeek(item.seconds)}
                      className="font-mono text-primary hover:underline font-semibold shrink-0 mt-0.5 cursor-pointer"
                      title="Seek video to gesture"
                    >
                      {item.timestamp}
                    </button>
                    <span className="text-text-muted mt-0.5">—</span>
                    <span className="text-text-primary leading-relaxed">{item.action}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-text-muted italic text-[11px]">
                No significant gestures or body movements detected.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Component 5: Camera Framing and Movement (Spanning Card) */}
      <div className="rounded-xl border border-card-border bg-card p-5 space-y-3.5 shadow-card">
        <div className="flex items-center justify-between border-b border-card-border/60 pb-3">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-lg bg-primary/15 text-primary border border-primary/25">
              <Video className="h-4 w-4" />
            </span>
            <div>
              <h3 className="text-sm font-bold text-text-primary">
                5. Camera Framing and Movement
              </h3>
              <p className="text-[11px] text-text-muted">
                Observed shot scales, framing shifts, and camera dynamics
              </p>
            </div>
          </div>
          <span className="rounded bg-background-elevated px-2 py-0.5 text-[10px] font-medium text-text-secondary border border-card-border">
            Estimated
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="rounded-lg bg-background-elevated/70 p-3.5 border border-card-border space-y-1">
            <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider block">
              Observed Shot Framing:
            </span>
            <p className="text-text-primary font-semibold capitalize">
              {observedFramings || "Medium close-up, close-up, medium shot"}
            </p>
            <p className="text-[11px] text-text-muted pt-1">
              Shots alternate rhythmically between tight focal crops on key statements and medium framing for demonstrations.
            </p>
          </div>

          <div className="rounded-lg bg-background-elevated/70 p-3.5 border border-card-border space-y-1">
            <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider block">
              Subject Position in Frame:
            </span>
            <p className="text-text-primary font-semibold">
              Vertical Center Axis
            </p>
            <p className="text-[11px] text-text-muted pt-1">
              Subject maintains central horizontal alignment with eyeline locked to the top-third horizontal guideline.
            </p>
          </div>

          <div className="rounded-lg bg-background-elevated/70 p-3.5 border border-card-border space-y-1">
            <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider block">
              Observed Camera Movement:
            </span>
            <p className="text-text-primary font-semibold capitalize">
              {observedMovements || "Slow push-in, crash zoom snap, static"}
            </p>
            <p className="text-[11px] text-text-muted pt-1">
              Fixed tripod camera baseline with digital zoom snaps and jump cuts synchronized to speech cadence.
            </p>
          </div>
        </div>
      </div>

      {/* Component 6: Scene-by-Scene Breakdown Table */}
      <div className="rounded-xl border border-card-border bg-card p-5 space-y-4 shadow-card">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-card-border/80 pb-3">
          <div>
            <h3 className="text-base font-bold text-text-primary flex items-center gap-2">
              <Film className="h-4 w-4 text-primary" />
              Scene-by-Scene Breakdown
            </h3>
            <p className="text-xs text-text-muted mt-0.5">
              Chronological visual breakdown of the entire Reel.
            </p>
          </div>

          <Button
            variant="secondary"
            size="sm"
            onClick={handleCopyAllBreakdown}
            leftIcon={
              copiedAll ? (
                <Check className="h-3.5 w-3.5 text-success" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )
            }
          >
            {copiedAll ? "Copied All" : "Copy Visual Breakdown"}
          </Button>
        </div>

        <div className="overflow-x-auto rounded-lg border border-card-border">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-background-elevated border-b border-card-border text-[11px] uppercase tracking-wider text-text-muted font-semibold">
              <tr>
                <th scope="col" className="w-36 sm:w-44 px-4 py-3">Time</th>
                <th scope="col" className="px-4 py-3">Visual Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-card-border/60 bg-card">
              {scenes.map((scene) => {
                const description = getSceneVisualDescription(scene);
                return (
                  <tr
                    key={scene.id}
                    className="hover:bg-background-elevated/60 transition-colors group"
                  >
                    <td className="px-4 py-3 align-top whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => onSeek(scene.startTime)}
                        className="inline-flex items-center gap-1.5 rounded bg-primary/10 hover:bg-primary/20 text-primary border border-primary/25 px-2 py-1 font-mono text-xs font-semibold transition-colors group-hover:border-primary/50 cursor-pointer"
                        title="Click to seek video to this scene"
                      >
                        <Play className="h-3 w-3 fill-current" />
                        <span>{scene.timestamp}</span>
                      </button>
                    </td>
                    <td className="px-4 py-3 align-top">
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-text-primary leading-relaxed font-normal">
                          {description}
                        </p>
                        <button
                          type="button"
                          onClick={() => handleCopyRow(scene.id, description)}
                          className="p-1 rounded text-text-muted hover:text-text-primary hover:bg-background-elevated transition-colors shrink-0 cursor-pointer"
                          title="Copy visual description"
                          aria-label="Copy visual description"
                        >
                          {copiedSceneId === scene.id ? (
                            <Check className="h-3.5 w-3.5 text-success" />
                          ) : (
                            <Copy className="h-3.5 w-3.5 opacity-60 group-hover:opacity-100" />
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
      </div>
    </div>
  );
};

export default VisualAnalysis;
