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
  Scissors,
  Palette,
  Type,
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
}) => {
  const [copiedSceneId, setCopiedSceneId] = useState<string | number | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);
  const [copiedText, setCopiedText] = useState(false);

  // =========================================================================
  // 1. Queued State
  // =========================================================================
  if (status === "queued") {
    return (
      <div className="rounded-2xl border border-primary/30 bg-card p-8 sm:p-12 shadow-card text-center space-y-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 text-primary mx-auto">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
        <div className="max-w-md mx-auto space-y-2">
          <h3 className="text-lg font-bold text-text-primary">
            {progressStepMessage || "Waiting for analysis..."}
          </h3>
          <p className="text-xs text-text-secondary leading-relaxed">
            Your Reel visual analysis job is queued with the secure background processor. Polling for results...
          </p>
          <div className="pt-2 text-[11px] font-mono text-text-muted flex items-center justify-center gap-2">
            <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            <span>Job Queued • Checking every 5 seconds</span>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 2. Processing State
  // =========================================================================
  if (status === "processing" || isProcessing) {
    return (
      <div className="rounded-2xl border border-primary/30 bg-card p-8 sm:p-12 shadow-card text-center space-y-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 text-primary mx-auto">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
        <div className="max-w-md mx-auto space-y-2">
          <h3 className="text-lg font-bold text-text-primary">
            {progressStepMessage || "Analyzing your Reel..."}
          </h3>
          <p className="text-xs text-text-secondary leading-relaxed">
            Extracting scene breakdown, identifying visible subjects, actions & clothing,
            mapping camera angles & framing, detecting visual transitions, and logging on-screen text.
          </p>
          <div className="pt-2 text-[11px] font-mono text-text-muted flex items-center justify-center gap-2">
            <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            <span>Processing frames at ~2 FPS in background • Checking every 5 seconds</span>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 2. Failed State with Retry Action
  // =========================================================================
  if (status === "failed" || errorMessage) {
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

  // =========================================================================
  // 3. Pending / Not Analyzed State
  // =========================================================================
  if (!realData && !data && (status === "pending" || !status)) {
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
            Your Reel is stored in private Supabase Storage. Run the Gemini AI Visual Analysis pipeline
            to observe scenes, camera framing, subject actions, environments, lighting, transitions, and on-screen text.
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

  // =========================================================================
  // 4. REAL BACKEND DATA RENDERING (VisualBackendResult)
  // =========================================================================
  if (realData) {
    const overview = realData.video_overview;
    const scenes = realData.scenes || [];
    const transitions = realData.transitions || [];
    const visualElements = realData.visual_elements || {
      readable_text: [],
      logos_and_graphics: [],
      recurring_visual_elements: [],
    };
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

    const handleCopyReadableText = () => {
      if (visualElements.readable_text?.length > 0) {
        navigator.clipboard.writeText(visualElements.readable_text.join("\n"));
        setCopiedText(true);
        setTimeout(() => setCopiedText(false), 2000);
      }
    };

    return (
      <div className="space-y-6">
        {/* Real Backend Evidence Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 rounded-xl bg-primary/10 border border-primary/25 px-4 py-3 text-xs shadow-sm">
          <div className="flex items-center gap-2.5 text-text-secondary">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-primary animate-pulse" />
            <span className="font-semibold text-text-primary">
              Real Visual Analysis
            </span>
            <span className="hidden sm:inline text-text-muted">
              — Direct frame observation from uploaded Reel bitstream via Gemini Multimodal
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-primary/15 text-primary border border-primary/25 font-semibold">
              Sampled at ~2 FPS
            </span>
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

                  {/* On-screen text for this scene if present */}
                  {scene.on_screen_text && scene.on_screen_text.length > 0 && (
                    <div className="flex items-center gap-2 pt-1 text-[11px] text-text-muted">
                      <span className="font-semibold text-primary">On-screen text:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {scene.on_screen_text.map((txt, tIdx) => (
                          <span
                            key={tIdx}
                            className="px-2 py-0.5 rounded bg-background-elevated text-text-primary font-mono text-[10px] border border-card-border"
                          >
                            "{txt}"
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
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
                {observedAngles.length > 0 ? observedAngles.join(", ") : "Eye-level"}
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
                {observedMovements.length > 0 ? observedMovements.join(", ") : "Static / Fixed"}
              </p>
              <p className="text-[11px] text-text-muted pt-1">
                Camera dynamics observed between consecutive sampled frames.
              </p>
            </div>
          </div>
        </div>

        {/* =================================================================== */}
        {/* SECTION 4: Editing and Transitions                                  */}
        {/* =================================================================== */}
        <div className="rounded-xl border border-card-border bg-card p-5 space-y-4 shadow-card">
          <div className="flex items-center gap-2.5 border-b border-card-border/60 pb-3">
            <span className="p-2 rounded-lg bg-primary/15 text-primary border border-primary/25">
              <Scissors className="h-4 w-4" />
            </span>
            <div>
              <h3 className="text-sm font-bold text-text-primary">
                4. Editing and Transitions ({transitions.length} {transitions.length === 1 ? "Event" : "Events"})
              </h3>
              <p className="text-[11px] text-text-muted">
                Observed cuts, transitions, and frame discontinuities
              </p>
            </div>
          </div>

          {transitions.length > 0 ? (
            <div className="overflow-x-auto rounded-lg border border-card-border">
              <table className="w-full text-left text-xs">
                <thead className="bg-background-elevated border-b border-card-border text-[11px] uppercase tracking-wider text-text-muted font-semibold">
                  <tr>
                    <th scope="col" className="w-32 px-4 py-2.5">Timestamp</th>
                    <th scope="col" className="w-40 px-4 py-2.5">Transition Type</th>
                    <th scope="col" className="px-4 py-2.5">Observable Visual Change</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-card-border/60 bg-card">
                  {transitions.map((item, idx) => (
                    <tr key={idx} className="hover:bg-background-elevated/40 transition-colors">
                      <td className="px-4 py-2.5 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => onSeek(item.timestamp_seconds)}
                          className="inline-flex items-center gap-1 rounded bg-primary/10 hover:bg-primary/20 text-primary border border-primary/25 px-2 py-0.5 font-mono text-[11px] font-semibold transition-colors cursor-pointer"
                          title="Seek video to transition"
                        >
                          <Play className="h-2.5 w-2.5 fill-current" />
                          <span>{formatSecondsToTimestamp(item.timestamp_seconds)}</span>
                        </button>
                      </td>
                      <td className="px-4 py-2.5 font-semibold text-text-primary">
                        <span className="inline-block px-2 py-0.5 rounded bg-background-elevated border border-card-border text-[11px]">
                          {item.transition_type || "Cut"}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-text-secondary leading-relaxed">
                        {item.observable_change || "Scene cut detected"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-xs text-text-muted italic">
              No distinct transition events detected in the sampled frames.
            </p>
          )}
        </div>

        {/* =================================================================== */}
        {/* SECTION 5: Visual Composition & Palette                             */}
        {/* =================================================================== */}
        <div className="rounded-xl border border-card-border bg-card p-5 space-y-4 shadow-card">
          <div className="flex items-center gap-2.5 border-b border-card-border/60 pb-3">
            <span className="p-2 rounded-lg bg-primary/15 text-primary border border-primary/25">
              <Palette className="h-4 w-4" />
            </span>
            <div>
              <h3 className="text-sm font-bold text-text-primary">
                5. Visual Composition & Palette
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
                {scenes[0]?.composition?.contrast_and_lighting_appearance ||
                  "Natural observable lighting consistent across frames."}
              </p>
            </div>
          </div>
        </div>

        {/* =================================================================== */}
        {/* SECTION 6: On-Screen Visual Elements                                */}
        {/* =================================================================== */}
        <div className="rounded-xl border border-card-border bg-card p-5 space-y-4 shadow-card">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-card-border/60 pb-3">
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-lg bg-primary/15 text-primary border border-primary/25">
                <Type className="h-4 w-4" />
              </span>
              <div>
                <h3 className="text-sm font-bold text-text-primary">
                  6. On-Screen Visual Elements
                </h3>
                <p className="text-[11px] text-text-muted">
                  Readable on-screen text, logos, graphical overlays, and recurring visual elements
                </p>
              </div>
            </div>

            {visualElements.readable_text?.length > 0 && (
              <Button
                variant="secondary"
                size="sm"
                onClick={handleCopyReadableText}
                leftIcon={
                  copiedText ? (
                    <Check className="h-3 w-3 text-success" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )
                }
              >
                {copiedText ? "Copied Text" : "Copy Text"}
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            {/* Readable Text */}
            <div className="rounded-lg bg-background-elevated/70 p-3.5 border border-card-border space-y-2">
              <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider block">
                Readable Text ({visualElements.readable_text?.length || 0}):
              </span>
              {visualElements.readable_text && visualElements.readable_text.length > 0 ? (
                <ul className="space-y-1 text-[11px] max-h-48 overflow-y-auto pr-1">
                  {visualElements.readable_text.map((txt, idx) => (
                    <li key={idx} className="p-1.5 rounded bg-card border border-card-border text-text-primary font-mono text-[10px]">
                      "{txt}"
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-text-muted italic text-[11px]">
                  No readable text detected in the sampled frames.
                </p>
              )}
            </div>

            {/* Logos & Graphics */}
            <div className="rounded-lg bg-background-elevated/70 p-3.5 border border-card-border space-y-2">
              <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider block">
                Logos & Graphics ({visualElements.logos_and_graphics?.length || 0}):
              </span>
              {visualElements.logos_and_graphics && visualElements.logos_and_graphics.length > 0 ? (
                <ul className="space-y-1 text-[11px]">
                  {visualElements.logos_and_graphics.map((logo, idx) => (
                    <li key={idx} className="text-text-primary">
                      • {logo}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-text-muted italic text-[11px]">
                  No distinct logos or graphical overlays detected.
                </p>
              )}
            </div>

            {/* Recurring Visual Elements */}
            <div className="rounded-lg bg-background-elevated/70 p-3.5 border border-card-border space-y-2">
              <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider block">
                Recurring Visual Elements:
              </span>
              {visualElements.recurring_visual_elements && visualElements.recurring_visual_elements.length > 0 ? (
                <ul className="space-y-1 text-[11px]">
                  {visualElements.recurring_visual_elements.map((el, idx) => (
                    <li key={idx} className="text-text-primary">
                      • {el}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-text-muted italic text-[11px]">
                  No recurring visual elements identified.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* =================================================================== */}
        {/* SECTION 7: Analysis Warnings & Methodology Notice                   */}
        {/* =================================================================== */}
        <div className="rounded-xl border border-card-border bg-card p-5 space-y-3 shadow-card">
          <div className="flex items-center gap-2 text-xs font-semibold text-text-primary">
            <Info className="h-4 w-4 text-primary" />
            <span>Methodology & Sampling Limitation Note</span>
          </div>

          <div className="rounded-lg bg-background-elevated/60 p-3 text-xs leading-relaxed text-text-secondary border border-card-border space-y-1.5">
            <p>
              <strong className="text-text-primary">2 FPS Frame-Sampling Limitation: </strong>
              Visual analysis sampled the video bitstream at approximately 2 frames per second (2 FPS).
              Sub-second jump cuts (&lt;0.5s), rapid subliminal flashes, or fine micro-motion between sampled frames
              may not be captured.
            </p>
            <p className="text-[11px] text-text-muted">
              Technical hardware specifications (e.g. camera models, lens focal lengths, physical lighting rigs) are intentionally not inferred to preserve strict empirical observation.
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
