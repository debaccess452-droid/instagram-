import React from "react";
import {
  Scissors,
  Film,
  Zap,
  Sliders,
  Sparkles,
  Volume2,
  Clock,
  Compass,
  CheckCircle2,
  Play,
} from "lucide-react";
import { EditingBreakdownData } from "../types/analysis";
import { cn } from "@/utils/cn";

interface EditingBreakdownProps {
  data: EditingBreakdownData;
  onSeek: (seconds: number) => void;
}

export const EditingBreakdown: React.FC<EditingBreakdownProps> = ({
  data,
  onSeek,
}) => {
  const { technical, pacing, audioEditing, visualEditing, storytellingArc } = data;

  return (
    <div className="space-y-6">
      {/* Technical Specifications Grid */}
      <div className="rounded-xl border border-card-border bg-card p-5 shadow-card space-y-4">
        <div className="flex items-center gap-2 border-b border-card-border/70 pb-3">
          <span className="p-2 rounded-lg bg-primary/15 text-primary border border-primary/25">
            <Film className="h-4 w-4" />
          </span>
          <div>
            <h3 className="text-base font-bold text-text-primary">
              Technical Video & Container Specifications
            </h3>
            <p className="text-xs text-text-muted">
              Codec, geometry, and frame parameters
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
          <div className="bg-background-elevated p-3 rounded-lg border border-card-border">
            <span className="text-[10px] text-text-muted uppercase font-semibold">Duration</span>
            <p className="font-mono font-bold text-text-primary mt-0.5">{technical.formattedDuration}</p>
          </div>
          <div className="bg-background-elevated p-3 rounded-lg border border-card-border">
            <span className="text-[10px] text-text-muted uppercase font-semibold">Aspect Ratio</span>
            <p className="font-mono font-bold text-text-primary mt-0.5">{technical.aspectRatio}</p>
          </div>
          <div className="bg-background-elevated p-3 rounded-lg border border-card-border">
            <span className="text-[10px] text-text-muted uppercase font-semibold">Resolution</span>
            <p className="font-mono font-bold text-text-primary mt-0.5">{technical.resolution}</p>
          </div>
          <div className="bg-background-elevated p-3 rounded-lg border border-card-border">
            <span className="text-[10px] text-text-muted uppercase font-semibold">Framerate</span>
            <p className="font-mono font-bold text-text-primary mt-0.5">{technical.estimatedFps} FPS</p>
          </div>
          <div className="bg-background-elevated p-3 rounded-lg border border-card-border">
            <span className="text-[10px] text-text-muted uppercase font-semibold">Orientation</span>
            <p className="font-bold text-text-primary mt-0.5 capitalize">{technical.orientation}</p>
          </div>
          <div className="bg-background-elevated p-3 rounded-lg border border-card-border">
            <span className="text-[10px] text-text-muted uppercase font-semibold">Codec</span>
            <p className="font-mono font-bold text-text-primary mt-0.5 truncate">{technical.format}</p>
          </div>
        </div>
      </div>

      {/* Editing Pacing & Cut Rhythm */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Pacing Card */}
        <div className="rounded-xl border border-card-border bg-card p-5 shadow-card space-y-4">
          <div className="flex items-center justify-between border-b border-card-border/70 pb-3">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-lg bg-cta/15 text-cta border border-cta/25">
                <Scissors className="h-4 w-4" />
              </span>
              <div>
                <h4 className="text-sm font-bold text-text-primary">Scene Pacing & Shot Cuts</h4>
                <p className="text-[11px] text-text-muted">Retention-engineered jump cut density</p>
              </div>
            </div>
            <span className="text-xs font-mono font-bold text-cta">
              {pacing.averageShotDurationSeconds}s / shot
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="bg-background-elevated p-2 rounded-lg border border-card-border">
              <span className="text-[10px] text-text-muted uppercase">Total Cuts</span>
              <p className="font-bold text-text-primary text-sm mt-0.5">{pacing.totalScenes}</p>
            </div>
            <div className="bg-background-elevated p-2 rounded-lg border border-card-border">
              <span className="text-[10px] text-text-muted uppercase">Jump Cuts</span>
              <p className="font-bold text-primary text-sm mt-0.5">{pacing.jumpCutCount}</p>
            </div>
            <div className="bg-background-elevated p-2 rounded-lg border border-card-border">
              <span className="text-[10px] text-text-muted uppercase">Beat Sync</span>
              <p className="font-bold text-success text-sm mt-0.5 capitalize">{pacing.beatSynchronization}</p>
            </div>
          </div>

          {/* Cut Timestamps */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-semibold text-text-muted uppercase">Cut Timestamps:</span>
            <div className="flex flex-wrap gap-1.5">
              {pacing.cutTimestamps.map((cut, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => onSeek(cut.seconds)}
                  className="rounded bg-background-elevated hover:bg-card-border px-2 py-0.5 text-[11px] font-mono text-text-secondary hover:text-text-primary border border-card-border transition-colors"
                >
                  {cut.timestamp}
                </button>
              ))}
            </div>
          </div>

          {/* Transitions breakdown */}
          <div className="space-y-1 text-xs">
            <span className="text-[11px] font-semibold text-text-muted uppercase">Transition Mix:</span>
            <div className="flex flex-wrap gap-2 pt-1">
              {pacing.transitionTypes.map((t, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 text-[11px] bg-background px-2 py-0.5 rounded border border-card-border text-text-primary"
                >
                  <span className="font-semibold text-primary">{t.count}x</span>
                  <span>{t.type}</span>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Audio & Visual Post-Production */}
        <div className="rounded-xl border border-card-border bg-card p-5 shadow-card space-y-4">
          <div className="flex items-center gap-2 border-b border-card-border/70 pb-3">
            <span className="p-2 rounded-lg bg-trust/15 text-trust border border-trust/25">
              <Sliders className="h-4 w-4" />
            </span>
            <div>
              <h4 className="text-sm font-bold text-text-primary">Post-Production Craft</h4>
              <p className="text-[11px] text-text-muted">Audio ducking, text animation, & VFX</p>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div className="bg-background-elevated p-2.5 rounded-lg border border-card-border space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <strong className="text-text-primary font-medium">Voiceover Editing:</strong>
                <span className="font-mono text-success">{audioEditing.voTimingScore}</span>
              </div>
              <p className="text-text-muted text-[11px]">{audioEditing.audioTransitionsDescription}</p>
            </div>

            <div className="bg-background-elevated p-2.5 rounded-lg border border-card-border space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <strong className="text-text-primary font-medium">Color Grading:</strong>
                <span className="text-primary font-medium">Custom Teal & Slate LUT</span>
              </div>
              <p className="text-text-muted text-[11px]">{visualEditing.colorGradingNotes}</p>
            </div>

            <div className="space-y-1.5">
              <span className="text-[11px] font-semibold text-text-muted uppercase">Applied Visual Effects (VFX):</span>
              <div className="flex flex-wrap gap-1.5">
                {visualEditing.vfxList.map((vfx, i) => (
                  <span
                    key={i}
                    className="rounded bg-background px-2 py-0.5 text-[11px] text-text-secondary border border-card-border"
                  >
                    {vfx}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Storytelling Structure Arc */}
      <div className="rounded-xl border border-card-border bg-card p-5 shadow-card space-y-4">
        <div className="flex items-center justify-between border-b border-card-border/70 pb-3">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-primary/15 text-primary border border-primary/25">
              <Compass className="h-4 w-4" />
            </span>
            <div>
              <h3 className="text-base font-bold text-text-primary">
                Storytelling Structure & Retention Architecture
              </h3>
              <p className="text-xs text-text-muted">
                Narrative stages mapped from Hook to Call to Action
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-1">
          {storytellingArc.map((arc, idx) => (
            <div
              key={idx}
              className="rounded-xl border border-card-border bg-background-elevated/70 p-4 space-y-2 hover:border-primary/40 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 font-bold text-xs text-text-primary">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/20 text-primary text-[10px]">
                    {idx + 1}
                  </span>
                  <span>{arc.stage}</span>
                </span>
                <button
                  type="button"
                  onClick={() => onSeek(arc.secondsStart)}
                  className="inline-flex items-center gap-1 text-[11px] font-mono text-primary hover:underline"
                >
                  <Play className="h-2.5 w-2.5 fill-current" />
                  <span>{arc.timestamp}</span>
                </button>
              </div>

              <p className="text-xs text-text-secondary leading-relaxed">
                {arc.description}
              </p>

              <div className="pt-2 border-t border-card-border/50 text-[11px] text-text-muted">
                <strong className="text-text-primary font-medium">Intent:</strong>{" "}
                {arc.engagementIntent}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
