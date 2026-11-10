import React from "react";
import {
  Clock,
  Layers,
  FileText,
  Type,
  CheckCircle2,
  ShieldCheck,
  TrendingUp,
  AlertTriangle,
  Play,
  Volume2,
  Sparkles,
  Zap,
} from "lucide-react";
import { ContentAnalysisResult } from "../types/analysis";
import { VideoPreviewPlayer, VideoPreviewPlayerRef } from "./VideoPreviewPlayer";
import { cn } from "@/utils/cn";

interface AnalysisOverviewProps {
  result: ContentAnalysisResult;
  playerRef: React.RefObject<VideoPreviewPlayerRef>;
  onSeek: (seconds: number) => void;
  onSelectTab: (tabKey: any) => void;
}

export const AnalysisOverview: React.FC<AnalysisOverviewProps> = ({
  result,
  playerRef,
  onSeek,
  onSelectTab,
}) => {
  const {
    durationSeconds,
    formattedDuration,
    aspectRatio,
    detectedLanguage,
    audioAnalysis,
    visualAnalysis,
    textExtraction,
    editingBreakdown,
    accuracyReport,
    keyStrengths,
    growthTakeaways,
    overviewSummary,
  } = result;

  return (
    <div className="space-y-6">
      {/* Top Grid: Video Player + Key Synthesis */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Interactive Video Preview */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <div className="w-full max-w-sm">
            <VideoPreviewPlayer
              ref={playerRef}
              src={result.videoUrl}
              poster={result.thumbnailUrl}
              durationSeconds={durationSeconds}
              aspectRatio="9:16"
              activeSceneTitle={`Active Analysis: ${visualAnalysis.totalScenes} Scenes`}
            />
          </div>

          <p className="mt-2 text-[11px] text-text-muted text-center">
            Click any timestamp across all tabs to jump the video directly to that second
          </p>
        </div>

        {/* Right Column: High-Level Synthesis & Metrics */}
        <div className="lg:col-span-7 space-y-4">
          {/* Executive Summary Card */}
          <div className="rounded-xl border border-card-border bg-gradient-to-br from-card to-background-elevated p-5 shadow-card space-y-3">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 rounded-md bg-primary/15 px-2.5 py-1 text-xs font-semibold text-primary border border-primary/25">
                <Sparkles className="h-3.5 w-3.5" />
                Executive Synthesis
              </span>
              <span className="text-xs font-mono text-text-muted">
                {result.videoFileName}
              </span>
            </div>

            <p className="text-sm text-text-secondary leading-relaxed">
              {overviewSummary}
            </p>

            {/* Dimension Verification Chips */}
            <div className="pt-2 border-t border-card-border/80 flex flex-wrap gap-2">
              <div className="inline-flex items-center gap-1 rounded bg-background px-2.5 py-1 text-[11px] font-medium text-text-primary border border-card-border">
                <Volume2 className="h-3 w-3 text-primary" />
                <span>Audio: 96% Clarity</span>
              </div>
              <div className="inline-flex items-center gap-1 rounded bg-background px-2.5 py-1 text-[11px] font-medium text-text-primary border border-card-border">
                <Layers className="h-3 w-3 text-trust" />
                <span>{visualAnalysis.totalScenes} Visual Cuts</span>
              </div>
              <div className="inline-flex items-center gap-1 rounded bg-background px-2.5 py-1 text-[11px] font-medium text-text-primary border border-card-border">
                <Type className="h-3 w-3 text-cta" />
                <span>{textExtraction.totalTextElements} OCR Captions</span>
              </div>
              <div className="inline-flex items-center gap-1 rounded bg-background px-2.5 py-1 text-[11px] font-medium text-success border border-success/30">
                <CheckCircle2 className="h-3 w-3" />
                <span>Synced Script Table</span>
              </div>
            </div>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-xl border border-card-border bg-card p-3.5">
              <div className="flex items-center gap-1.5 text-[11px] text-text-muted">
                <Clock className="h-3.5 w-3.5 text-primary" />
                <span>Duration</span>
              </div>
              <div className="mt-1 font-mono text-base font-bold text-text-primary">
                {formattedDuration}
              </div>
              <p className="text-[10px] text-text-muted">{aspectRatio} Vertical</p>
            </div>

            <div className="rounded-xl border border-card-border bg-card p-3.5">
              <div className="flex items-center gap-1.5 text-[11px] text-text-muted">
                <Zap className="h-3.5 w-3.5 text-cta" />
                <span>Pacing</span>
              </div>
              <div className="mt-1 font-mono text-base font-bold text-text-primary">
                {editingBreakdown.pacing.averageShotDurationSeconds}s
              </div>
              <p className="text-[10px] text-text-muted">Avg. shot length</p>
            </div>

            <div className="rounded-xl border border-card-border bg-card p-3.5">
              <div className="flex items-center gap-1.5 text-[11px] text-text-muted">
                <FileText className="h-3.5 w-3.5 text-trust" />
                <span>Words</span>
              </div>
              <div className="mt-1 font-mono text-base font-bold text-text-primary">
                {audioAnalysis.voice.paceWpm} WPM
              </div>
              <p className="text-[10px] text-text-muted">{detectedLanguage}</p>
            </div>

            <div className="rounded-xl border border-card-border bg-card p-3.5">
              <div className="flex items-center gap-1.5 text-[11px] text-text-muted">
                <ShieldCheck className="h-3.5 w-3.5 text-success" />
                <span>Accuracy</span>
              </div>
              <div className="mt-1 font-mono text-base font-bold text-success">
                {accuracyReport.overallScore}%
              </div>
              <p className="text-[10px] text-text-muted">Verified Evidence</p>
            </div>
          </div>

          {/* Key Strengths & Opportunities */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            <div className="rounded-xl border border-success/20 bg-success/5 p-4 space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-success">
                <TrendingUp className="h-4 w-4" />
                <span>High-Converting Strengths</span>
              </div>
              <ul className="space-y-1.5 text-xs text-text-secondary">
                {keyStrengths.map((str, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-success font-bold">•</span>
                    <span>{str}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-xl border border-warning/20 bg-warning/5 p-4 space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-warning">
                <AlertTriangle className="h-4 w-4" />
                <span>Strategic Optimizations</span>
              </div>
              <ul className="space-y-1.5 text-xs text-text-secondary">
                {growthTakeaways.map((opp, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-warning font-bold">•</span>
                    <span>{opp}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Synchronized Multi-Track Timeline */}
      <div className="rounded-xl border border-card-border bg-card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
              <Layers className="h-4 w-4 text-primary" />
              Synchronized Multimodal Timeline
            </h3>
            <p className="text-xs text-text-muted mt-0.5">
              Click any block to seek the video to that exact scene cut or audio burst
            </p>
          </div>
          <button
            type="button"
            onClick={() => onSelectTab("script")}
            className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
          >
            Open Full Script Table →
          </button>
        </div>

        {/* Timeline Visualization */}
        <div className="space-y-3 pt-2">
          {/* Track 1: Visual Scenes */}
          <div>
            <div className="flex justify-between text-[11px] text-text-muted mb-1 font-medium">
              <span className="flex items-center gap-1.5">
                <Layers className="h-3 w-3 text-primary" />
                Track 1: Visual Scenes ({visualAnalysis.scenes.length} cuts)
              </span>
              <span className="font-mono">{formattedDuration} total</span>
            </div>
            <div className="h-7 w-full rounded-md bg-background-elevated border border-card-border flex overflow-hidden p-0.5 gap-0.5">
              {visualAnalysis.scenes.map((scene) => {
                const widthPercent =
                  ((scene.endTime - scene.startTime) / durationSeconds) * 100;
                return (
                  <button
                    key={scene.id}
                    type="button"
                    onClick={() => onSeek(scene.startTime)}
                    className="h-full rounded bg-primary/25 hover:bg-primary/50 text-white flex items-center justify-center text-[10px] font-mono px-1 transition-all group relative border border-primary/40 truncate"
                    style={{ width: `${Math.max(widthPercent, 5)}%` }}
                    title={`Scene ${scene.sceneNumber}: ${scene.timestamp} (${scene.cameraAngle})`}
                  >
                    <span>S{scene.sceneNumber}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Track 2: Spoken Voiceover */}
          <div>
            <div className="flex justify-between text-[11px] text-text-muted mb-1 font-medium">
              <span className="flex items-center gap-1.5">
                <Volume2 className="h-3 w-3 text-trust" />
                Track 2: Speech & Voiceover ({audioAnalysis.segments.length} segments)
              </span>
              <span className="font-mono text-text-muted">{audioAnalysis.voice.paceWpm} WPM</span>
            </div>
            <div className="h-7 w-full rounded-md bg-background-elevated border border-card-border flex overflow-hidden p-0.5 gap-0.5">
              {audioAnalysis.segments.map((seg) => {
                const widthPercent =
                  ((seg.endTime - seg.startTime) / durationSeconds) * 100;
                return (
                  <button
                    key={seg.id}
                    type="button"
                    onClick={() => onSeek(seg.startTime)}
                    className="h-full rounded bg-trust/20 hover:bg-trust/45 text-white flex items-center justify-center text-[10px] font-mono px-1 transition-all border border-trust/30 truncate"
                    style={{ width: `${Math.max(widthPercent, 5)}%` }}
                    title={`${seg.timestamp}: "${seg.spokenText}"`}
                  >
                    <span className="truncate">{seg.spokenText.slice(0, 15)}...</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Track 3: OCR Kinetic Text */}
          <div>
            <div className="flex justify-between text-[11px] text-text-muted mb-1 font-medium">
              <span className="flex items-center gap-1.5">
                <Type className="h-3 w-3 text-cta" />
                Track 3: On-Screen Text ({textExtraction.textElements.length} elements)
              </span>
              <span className="font-mono text-text-muted">Kinetic Grotesque</span>
            </div>
            <div className="h-7 w-full rounded-md bg-background-elevated border border-card-border flex overflow-hidden p-0.5 gap-0.5">
              {textExtraction.textElements.map((txt) => {
                const widthPercent =
                  ((txt.endTime - txt.startTime) / durationSeconds) * 100;
                return (
                  <button
                    key={txt.id}
                    type="button"
                    onClick={() => onSeek(txt.startTime)}
                    className="h-full rounded bg-cta/20 hover:bg-cta/40 text-cta flex items-center justify-center text-[10px] font-mono px-1 transition-all border border-cta/30 truncate"
                    style={{ width: `${Math.max(widthPercent, 4)}%` }}
                    title={`${txt.timestamp}: "${txt.exactText}"`}
                  >
                    <span className="truncate">{txt.exactText.slice(0, 12)}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
