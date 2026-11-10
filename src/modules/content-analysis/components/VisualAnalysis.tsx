import React, { useState } from "react";
import {
  Layers,
  Camera,
  Play,
  Maximize2,
  Tag,
  Compass,
  Sun,
  Eye,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { VisualAnalysisData, VisualScene } from "../types/analysis";
import { cn } from "@/utils/cn";

interface VisualAnalysisProps {
  data: VisualAnalysisData;
  onSeek: (seconds: number) => void;
}

export const VisualAnalysis: React.FC<VisualAnalysisProps> = ({ data, onSeek }) => {
  const [selectedSceneId, setSelectedSceneId] = useState<string>(
    data.scenes[0]?.id || ""
  );

  const selectedScene =
    data.scenes.find((s) => s.id === selectedSceneId) || data.scenes[0];

  return (
    <div className="space-y-6">
      {/* Top Visual Setup Specs */}
      <div className="rounded-xl border border-card-border bg-card p-5 shadow-card space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-card-border/70 pb-3">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-primary/15 text-primary border border-primary/25">
              <Camera className="h-4 w-4" />
            </span>
            <div>
              <h3 className="text-base font-bold text-text-primary">
                Visual Cinematography & Scene Breakdown
              </h3>
              <p className="text-xs text-text-muted">
                {data.totalScenes} optical shot cuts detected with frame-by-frame analysis
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-text-muted">Color Palette:</span>
            <div className="flex items-center gap-1.5">
              {data.dominantColorPalette.map((col, idx) => (
                <div
                  key={idx}
                  className="h-5 w-5 rounded-full border border-card-border shadow-sm"
                  style={{ backgroundColor: col.split(" ")[0] }}
                  title={col}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-text-secondary">
          <div className="bg-background-elevated p-3 rounded-lg border border-card-border">
            <strong className="text-text-primary font-semibold">Lighting Setup:</strong>{" "}
            {data.lightingStyle}
          </div>
          <div className="bg-background-elevated p-3 rounded-lg border border-card-border">
            <strong className="text-text-primary font-semibold">Framing Grid:</strong>{" "}
            {data.framingConsistency}
          </div>
        </div>
      </div>

      {/* Visual Scene Storyboard Timeline (Thumbnails Bar) */}
      <div className="rounded-xl border border-card-border bg-card p-5 space-y-4 shadow-card">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-text-primary flex items-center gap-2">
            <Layers className="h-4 w-4 text-primary" />
            Shot Sequence Strip ({data.scenes.length} Scenes)
          </h4>
          <span className="text-xs text-text-muted">Click any scene to inspect & seek</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
          {data.scenes.map((scene) => {
            const isSelected = scene.id === selectedScene?.id;
            return (
              <button
                key={scene.id}
                type="button"
                onClick={() => {
                  setSelectedSceneId(scene.id);
                  onSeek(scene.startTime);
                }}
                className={cn(
                  "relative flex flex-col rounded-lg border overflow-hidden text-left transition-all group",
                  isSelected
                    ? "border-primary ring-2 ring-primary/40 bg-primary/10 -translate-y-1 shadow-glow-primary"
                    : "border-card-border bg-background-elevated hover:border-primary/40 hover:bg-card"
                )}
              >
                {/* Scene Thumbnail Representation */}
                <div
                  className={cn(
                    "h-20 w-full bg-gradient-to-br flex flex-col justify-between p-2 relative",
                    scene.thumbnailColor || "from-slate-800 to-navy-900"
                  )}
                >
                  <span className="self-start text-[10px] font-bold text-white bg-black/60 px-1.5 py-0.5 rounded backdrop-blur-sm">
                    S{scene.sceneNumber}
                  </span>
                  <div className="flex items-center justify-between text-[10px] text-white/90">
                    <span className="font-mono">{scene.timestamp.split("–")[0]}</span>
                    <Play className="h-3 w-3 fill-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>

                <div className="p-2 space-y-1">
                  <p className="text-[11px] font-semibold text-text-primary truncate">
                    {scene.cameraFraming}
                  </p>
                  <p className="text-[10px] text-text-muted truncate">
                    {scene.cameraMovement}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Scene Deep Inspection Card */}
      {selectedScene && (
        <div className="rounded-xl border border-primary/30 bg-gradient-to-b from-card to-background-elevated p-6 shadow-card space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-card-border/80 pb-4">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-white font-bold text-sm shadow-glow-primary">
                S{selectedScene.sceneNumber}
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-text-primary">
                    Scene {selectedScene.sceneNumber} Detailed Analysis
                  </h3>
                  <button
                    type="button"
                    onClick={() => onSeek(selectedScene.startTime)}
                    className="inline-flex items-center gap-1.5 rounded bg-primary/15 hover:bg-primary/25 text-primary border border-primary/30 px-2 py-0.5 text-xs font-mono font-semibold transition-colors"
                  >
                    <Play className="h-3 w-3 fill-current" />
                    <span>{selectedScene.timestamp}</span>
                  </button>
                </div>
                <p className="text-xs text-text-secondary mt-0.5">
                  Transition: {selectedScene.transitionIn}
                </p>
              </div>
            </div>

            {/* Quick Badges */}
            <div className="flex flex-wrap gap-1.5">
              <span className="rounded bg-background px-2.5 py-1 text-xs font-medium text-text-primary border border-card-border">
                {selectedScene.cameraAngle}
              </span>
              <span className="rounded bg-background px-2.5 py-1 text-xs font-medium text-primary border border-primary/30">
                {selectedScene.cameraFraming}
              </span>
              <span className="rounded bg-background px-2.5 py-1 text-xs font-medium text-text-primary border border-card-border">
                {selectedScene.cameraMovement}
              </span>
            </div>
          </div>

          {/* Detailed Breakdown Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Setting & Environment */}
            <div className="rounded-lg bg-background-elevated p-3.5 border border-card-border space-y-1">
              <span className="text-[10px] font-semibold text-text-muted uppercase flex items-center gap-1">
                <Compass className="h-3 w-3 text-primary" />
                Setting & Environment
              </span>
              <p className="text-text-primary leading-relaxed">
                {selectedScene.settingAndBackground}
              </p>
            </div>

            {/* Subject Description & Clothing */}
            <div className="rounded-lg bg-background-elevated p-3.5 border border-card-border space-y-1">
              <span className="text-[10px] font-semibold text-text-muted uppercase flex items-center gap-1">
                <Eye className="h-3 w-3 text-trust" />
                Subject & Wardrobe
              </span>
              <p className="text-text-primary leading-relaxed">
                {selectedScene.subjectDescription}
              </p>
              {selectedScene.clothingAndAppearance && (
                <p className="text-text-secondary text-[11px] pt-1">
                  <strong>Appearance:</strong> {selectedScene.clothingAndAppearance}
                </p>
              )}
            </div>

            {/* Subject Gestures & Body Language */}
            <div className="rounded-lg bg-background-elevated p-3.5 border border-card-border space-y-1">
              <span className="text-[10px] font-semibold text-text-muted uppercase flex items-center gap-1">
                <Sparkles className="h-3 w-3 text-cta" />
                Actions & Gestures
              </span>
              <p className="text-text-primary leading-relaxed">
                {selectedScene.subjectActionsAndGestures}
              </p>
            </div>

            {/* Composition & Lighting */}
            <div className="rounded-lg bg-background-elevated p-3.5 border border-card-border space-y-1">
              <span className="text-[10px] font-semibold text-text-muted uppercase flex items-center gap-1">
                <Sun className="h-3 w-3 text-warning" />
                Composition & Lighting
              </span>
              <p className="text-text-primary leading-relaxed">
                {selectedScene.composition}
              </p>
              <p className="text-text-secondary text-[11px] pt-1">
                <strong>Lighting:</strong> {selectedScene.lighting}
              </p>
            </div>
          </div>

          {/* Storytelling Purpose & Props */}
          <div className="rounded-lg bg-primary/10 border border-primary/20 p-4 space-y-2">
            <span className="text-[11px] font-semibold text-primary uppercase tracking-wider flex items-center gap-1.5">
              <Compass className="h-3.5 w-3.5" />
              Strategic Storytelling Purpose
            </span>
            <p className="text-sm font-medium text-text-primary leading-relaxed">
              {selectedScene.storytellingPurpose}
            </p>

            {selectedScene.objectsAndProps.length > 0 && (
              <div className="flex items-center gap-2 pt-2 border-t border-primary/20 flex-wrap">
                <span className="text-[11px] text-text-muted">Detected Props:</span>
                {selectedScene.objectsAndProps.map((prop, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 rounded bg-background/80 px-2 py-0.5 text-[11px] text-text-secondary border border-card-border"
                  >
                    <Tag className="h-2.5 w-2.5 text-primary" />
                    {prop}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
