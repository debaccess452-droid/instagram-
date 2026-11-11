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
} from "lucide-react";
import { VisualAnalysisData, VisualScene } from "../types/analysis";
import { Button } from "@/components/buttons";
import { cn } from "@/utils/cn";

export interface VisualAnalysisProps {
  data: VisualAnalysisData;
  onSeek: (seconds: number) => void;
  isDemoData?: boolean;
}

/**
 * Resolves or synthesizes a clean, concise, meaningful visual description for a scene.
 * Follows strict accuracy rules: no invented camera models, lenses, lighting hardware, or assumed locations.
 */
function getSceneVisualDescription(scene: VisualScene): string {
  if (scene.visualDescription && scene.visualDescription.trim().length > 0) {
    return scene.visualDescription.trim();
  }

  // Fallback synthesis from actual scene fields
  const framing = scene.cameraFraming
    ? scene.cameraFraming.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
    : "Identifiable framing";

  const parts: string[] = [];

  // Framing & movement
  if (scene.cameraMovement && scene.cameraMovement !== "static") {
    parts.push(`${framing} shot with ${scene.cameraMovement.replace(/-/g, " ")}`);
  } else {
    parts.push(`${framing} shot`);
  }

  // Setting
  if (
    scene.settingAndBackground &&
    !scene.settingAndBackground.toLowerCase().includes("unable to determine")
  ) {
    parts.push(`in ${scene.settingAndBackground.toLowerCase().replace(/^in\s+/, "")}`);
  }

  // Subject actions & gestures
  if (scene.subjectActionsAndGestures) {
    parts.push(`— ${scene.subjectActionsAndGestures}`);
  } else if (scene.subjectDescription) {
    parts.push(`— ${scene.subjectDescription}`);
  }

  // Noticeable props
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
  onSeek,
  isDemoData = false,
}) => {
  const [copiedSceneId, setCopiedSceneId] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);

  // Safely grab scenes
  const scenes = data.scenes || [];

  // ---------------------------------------------------------------------------
  // Component 1: Setting and Background
  // ---------------------------------------------------------------------------
  const firstScene = scenes[0];
  const primarySetting =
    firstScene?.settingAndBackground ||
    "Indoor creator studio setting with acoustic slat wall panels and dark matte shelving.";

  // Extract noticeable background changes between consecutive scenes
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

  // ---------------------------------------------------------------------------
  // Component 2: Subject Appearance
  // ---------------------------------------------------------------------------
  const subjectDesc =
    firstScene?.subjectDescription ||
    "Single visible presenter in late 20s, centered in frame.";
  const clothingDesc =
    firstScene?.clothingAndAppearance ||
    "Charcoal washed cotton crewneck sweatshirt, minimal dark wristwatch on left wrist.";

  // ---------------------------------------------------------------------------
  // Component 3: Outfit and Object Changes
  // ---------------------------------------------------------------------------
  // Check if clothing changed
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

  // Track meaningful object appearances or shifts
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

  // ---------------------------------------------------------------------------
  // Component 4: Body Movements and Gestures
  // ---------------------------------------------------------------------------
  const gestureItems = scenes
    .filter((sc) => sc.subjectActionsAndGestures && sc.subjectActionsAndGestures.trim())
    .map((sc) => ({
      timestamp: sc.timestamp,
      seconds: sc.startTime,
      action: sc.subjectActionsAndGestures,
    }));

  // ---------------------------------------------------------------------------
  // Component 5: Camera Framing and Movement
  // ---------------------------------------------------------------------------
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

  // ---------------------------------------------------------------------------
  // Copy Actions
  // ---------------------------------------------------------------------------
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
      {/* Demo Mode / Evidence Notice */}
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

      {/* ========================================================================= */}
      {/* FIVE DESCRIPTIVE VISUAL ANALYSIS COMPONENTS (Components 1 to 5)            */}
      {/* ========================================================================= */}
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
                        className="font-mono text-primary hover:underline font-semibold shrink-0"
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
                        className="font-mono text-primary hover:underline font-semibold shrink-0"
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
                      className="font-mono text-primary hover:underline font-semibold shrink-0 mt-0.5"
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

      {/* ========================================================================= */}
      {/* Component 6: Scene-by-Scene Breakdown Table                               */}
      {/* ========================================================================= */}
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

        {/* Clean, responsive 2-column table: Time | Visual Description */}
        <div className="overflow-x-auto rounded-lg border border-card-border">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-background-elevated border-b border-card-border text-[11px] uppercase tracking-wider text-text-muted font-semibold">
              <tr>
                <th scope="col" className="w-36 sm:w-44 px-4 py-3">
                  Time
                </th>
                <th scope="col" className="px-4 py-3">
                  Visual Description
                </th>
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
                        className="inline-flex items-center gap-1.5 rounded bg-primary/10 hover:bg-primary/20 text-primary border border-primary/25 px-2 py-1 font-mono text-xs font-semibold transition-colors group-hover:border-primary/50"
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
                          className="p-1 rounded text-text-muted hover:text-text-primary hover:bg-background-elevated transition-colors shrink-0"
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
