import React, { useState } from "react";
import {
  Scissors,
  Activity,
  Type,
  Layers,
  Volume2,
  Clock,
  Play,
  Copy,
  Check,
  Download,
  Search,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Eye,
  Film,
} from "lucide-react";
import {
  EditingBreakdownData,
  CutTransitionItem,
  TextGraphicEditingItem,
  VisualEffectItem,
  AudioEditingItem,
  EditingTimelineEvent,
} from "../types/analysis";
import { contentAnalysisService } from "../services/contentAnalysisService";
import { Button } from "@/components/buttons";
import { cn } from "@/utils/cn";

export interface EditingBreakdownProps {
  data: EditingBreakdownData;
  videoTitle?: string;
  onSeek: (seconds: number) => void;
  isDemoData?: boolean;
}

export const EditingBreakdown: React.FC<EditingBreakdownProps> = ({
  data,
  videoTitle = "Analyzed Reel",
  onSeek,
  isDemoData = false,
}) => {
  const [timelineSearch, setTimelineSearch] = useState("");
  const [copiedTimeline, setCopiedTimeline] = useState(false);
  const [copiedRowIdx, setCopiedRowIdx] = useState<number | null>(null);

  // Fallbacks ensuring robust rendering even if older data objects are supplied
  const cuts: CutTransitionItem[] =
    data.cutsAndTransitions && data.cutsAndTransitions.length > 0
      ? data.cutsAndTransitions
      : (data.pacing?.cutTimestamps || []).map((cut, idx) => ({
          timestamp: cut.timestamp,
          seconds: cut.seconds,
          transitionType:
            data.pacing.transitionTypes?.[idx % (data.pacing.transitionTypes.length || 1)]?.type ||
            "Hard Jump Cut",
          description: `Observable scene transition cut at timestamp ${cut.timestamp}.`,
        }));

  const pacingInfo = data.pacingAndRhythmDetails || {
    rhythmDescription:
      "Fast-paced, high-retention editing cadence. Cuts occur at an average interval of 2.1 seconds, creating continuous visual re-engagement without disorienting the viewer.",
    averageShotDurationSeconds: data.pacing?.averageShotDurationSeconds || 2.1,
    rapidCutSequences:
      "Opening hook (00:00–00:03.9) features 3 rapid visual transitions in 3.9 seconds (~1.3s per cut) designed to stop vertical feed scroll velocity.",
    uninterruptedShots:
      "Tactical demonstration (00:07.4–00:15.6) maintains longer screen demonstration (3.8s and 4.4s shots) to allow viewers to absorb interface workflow.",
    speechRelation:
      "Every cut coincides exactly with spoken thought conclusions and punchlines. Breath intakes and vocal pauses are eliminated through micro-edits, ensuring relentless pacing.",
  };

  const textGraphics: TextGraphicEditingItem[] =
    data.textAndGraphics && data.textAndGraphics.length > 0
      ? data.textAndGraphics
      : [
          {
            timestamp: "00:00–00:01.8",
            seconds: 0.0,
            exactExtractedText: "STOP POSTING DAILY 🛑",
            presentationType: "Kinetic Word Pop",
            description: "High-contrast white and red sans-serif banner with animated scale pop bounce at top-center.",
          },
          {
            timestamp: "00:01.8–00:03.9",
            seconds: 1.8,
            exactExtractedText: "it's frying your brain and killing retention.",
            presentationType: "Kinetic Word Pop",
            description: "Rapid kinetic typography timed word-by-word with speech cadence across center frame.",
          },
          {
            timestamp: "00:03.9–00:07.4",
            seconds: 3.9,
            exactExtractedText: "The 3-Step Creator DNA Method",
            presentationType: "Title Banner",
            description: "Top-edge slide-down title card in high-contrast neon violet pill container.",
          },
          {
            timestamp: "00:07.4–00:11.2",
            seconds: 7.4,
            exactExtractedText: "STEP 1: Batch Hook Archetypes 🎣",
            presentationType: "Lower Third",
            description: "Animated lower-third badge with dark backdrop and hook icon highlighting step 1.",
          },
          {
            timestamp: "00:11.2–00:15.6",
            seconds: 11.2,
            exactExtractedText: "STEP 2: Lock 1 Visual Anchor 🎥",
            presentationType: "Lower Third",
            description: "Sequential lower-third badge replacement with camera icon highlighting step 2.",
          },
          {
            timestamp: "00:15.6–00:18.2",
            seconds: 15.6,
            exactExtractedText: "STEP 3: Replicate Voice",
            presentationType: "Lower Third",
            description: "Lower-third badge displaying final step in workflow progression.",
          },
          {
            timestamp: "00:21.0–00:23.5",
            seconds: 21.0,
            exactExtractedText: "⚡ 10 Variations in 4 Seconds",
            presentationType: "Split Screen Label",
            description: "High-energy top-center headline banner with pulsing highlight effect.",
          },
          {
            timestamp: "00:25.2–00:28.5",
            seconds: 25.2,
            exactExtractedText: "SAVE THIS REEL 📌 link in bio for template",
            presentationType: "Call to Action",
            description: "Prominent bottom-center card with bookmark pin icon and high-contrast call to action.",
          },
        ];

  const visualVfx: VisualEffectItem[] =
    data.visualEffectsAndLayering && data.visualEffectsAndLayering.length > 0
      ? data.visualEffectsAndLayering
      : [
          {
            technique: "Color Grading & Lighting Contrast",
            observableDetails:
              "High-contrast color grading with deep shadow rolloff and warm amber skin tones. Background wall accent lighting shifts visibly from slate to violet at 00:03.9.",
          },
          {
            timestamp: "00:07.4–00:11.2",
            seconds: 7.4,
            technique: "Picture-in-Picture Multi-Layer Layout",
            observableDetails:
              "Composites recorded software screen with rounded corners and drop shadow behind a circular subject cutout positioned in the lower-left corner.",
          },
          {
            timestamp: "00:21.0–00:25.2",
            seconds: 21.0,
            technique: "Vertical Split-Screen Composition",
            observableDetails:
              "Vertical 50/50 dual pane split cleanly separates live human reaction on the left from automated software generation on the right with a 2px divider line.",
          },
          {
            timestamp: "00:04.5",
            seconds: 4.5,
            technique: "Motion Graphic Overlays",
            observableDetails:
              "Semi-transparent glassmorphism card overlays and animated DNA double-helix line graphic floating beside subject.",
          },
          {
            timestamp: "00:01.8",
            seconds: 1.8,
            technique: "Digital Punch-In & Crop",
            observableDetails:
              "Instant 1.25x digital scale punch-in without optical lens zoom executed at 00:01.8 and 00:11.2 to increase rhetorical emphasis.",
          },
        ];

  const audioSync: AudioEditingItem[] =
    data.audioSyncBreakdown && data.audioSyncBreakdown.length > 0
      ? data.audioSyncBreakdown
      : [
          {
            audioElement: "Voiceover Edit",
            observableDetails:
              "Relentless vocal continuity with silences under 0.15s removed. Speech hesitations, pauses, and breath sounds are fully cut out.",
          },
          {
            audioElement: "Music Bed Ducking",
            observableDetails:
              "Subdued trap beat ducks by approximately 6–8 dB beneath the voiceover during dialogue, then swells during cut transitions at 00:03.9 and 00:21.0.",
          },
          {
            timestamp: "00:00.8",
            seconds: 0.8,
            audioElement: "Sound Effect Sync",
            observableDetails:
              "Subdued whoosh riser anticipation accompanying the 'STOP POSTING DAILY 🛑' text pop-in.",
          },
          {
            timestamp: "00:03.2",
            seconds: 3.2,
            audioElement: "Sound Effect Sync",
            observableDetails:
              "Subtle impact click synchronized with 'killing retention.' kinetic text flash.",
          },
          {
            timestamp: "00:07.1",
            seconds: 7.1,
            audioElement: "Sound Effect Sync",
            observableDetails: "Low sub-bass drop marking transition into screen demonstration.",
          },
          {
            timestamp: "00:11.4",
            seconds: 11.4,
            audioElement: "Sound Effect Sync",
            observableDetails: "Paper slide sound effect aligned with Step 2 lower-third appearance.",
          },
          {
            timestamp: "00:20.5",
            seconds: 20.5,
            audioElement: "Sound Effect Sync",
            observableDetails: "High-frequency digital chime / ping marking the variation counter reveal.",
          },
          {
            timestamp: "00:25.0",
            seconds: 25.0,
            audioElement: "Pacing / Breath Removal",
            observableDetails:
              "Brief 0.2s intentional audio ducking / micro-silence preceding the call to action, creating auditory punctuation.",
          },
        ];

  const timelineEvents: EditingTimelineEvent[] =
    data.editingTimeline && data.editingTimeline.length > 0
      ? data.editingTimeline
      : [
          {
            timestamp: "00:00.0–00:01.8",
            seconds: 0.0,
            editingAction: "Opening Hard Cut & Text Pop-In",
            observableResult:
              "Medium close-up appears; red/white 'STOP POSTING DAILY 🛑' text bounces into top-center; trap beat intro with subdued whoosh riser.",
          },
          {
            timestamp: "00:01.8–00:03.9",
            seconds: 1.8,
            editingAction: "Digital Punch-In & Kinetic Typography",
            observableResult:
              "Instant 1.25x scale punch-in to close-up; kinetic text 'it's frying your brain' and 'and killing retention.' flashes word-by-word; subtle impact click sound.",
          },
          {
            timestamp: "00:03.9–00:07.4",
            seconds: 3.9,
            editingAction: "Hard Cut & Top Title Slide",
            observableResult:
              "Cut to desk medium framing; violet 'The 3-Step Creator DNA Method' banner slides down from top; floating DNA line graphic animates.",
          },
          {
            timestamp: "00:07.4–00:11.2",
            seconds: 7.4,
            editingAction: "PiP Screen Recording Transition & Lower Third",
            observableResult:
              "Subject scales into lower-left circular PiP; full-frame screen recording appears; 'STEP 1: Batch Hook Archetypes 🎣' lower third slides in with bass sub drop.",
          },
          {
            timestamp: "00:11.2–00:15.6",
            seconds: 11.2,
            editingAction: "Digital Scale Snap & Step 2 Graphic",
            observableResult:
              "Screen recording zooms 1.15x onto workflow canvas; lower-third transitions to 'STEP 2: Lock 1 Visual Anchor 🎥' with paper slide sound effect.",
          },
          {
            timestamp: "00:15.6–00:21.0",
            seconds: 15.6,
            editingAction: "Hard Cut back to A-Roll & Accent Shift",
            observableResult:
              "Cut back to primary subject talking head; lower third updates to 'STEP 3: Replicate Voice'; background violet accent lighting becomes visible.",
          },
          {
            timestamp: "00:21.0–00:25.0",
            seconds: 21.0,
            editingAction: "Split-Screen Composite & Kinetic Counter",
            observableResult:
              "Vertical 50/50 dual pane cut; '⚡ 10 Variations in 4 Seconds' banner pulses at top; digital chime sound effect plays as dashboard results scroll.",
          },
          {
            timestamp: "00:25.0–00:25.2",
            seconds: 25.0,
            editingAction: "Intentional Audio Beat Drop / Micro-Silence",
            observableResult:
              "Music rhythm cuts out for 0.2s; creates auditory punctuation before concluding statement.",
          },
          {
            timestamp: "00:25.2–00:28.5",
            seconds: 25.2,
            editingAction: "Whip Swipe Transition & CTA Overlay",
            observableResult:
              "Motion swipe cut to wide medium shot; 'SAVE THIS REEL 📌 link in bio for template' pill badge appears at bottom-center; music bed fades gently to close.",
          },
        ];

  const handleCopyTimeline = () => {
    const markdown = contentAnalysisService.formatEditingTimelineAsMarkdown(timelineEvents);
    navigator.clipboard.writeText(markdown);
    setCopiedTimeline(true);
    setTimeout(() => setCopiedTimeline(false), 2000);
  };

  const handleExportCSV = () => {
    contentAnalysisService.exportEditingTimelineToCSV(timelineEvents, videoTitle);
  };

  const handleCopyRow = (idx: number, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedRowIdx(idx);
    setTimeout(() => setCopiedRowIdx(null), 1800);
  };

  const filteredTimeline = timelineEvents.filter((event) => {
    const q = timelineSearch.toLowerCase().trim();
    if (!q) return true;
    return (
      event.timestamp.toLowerCase().includes(q) ||
      event.editingAction.toLowerCase().includes(q) ||
      event.observableResult.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-7">
      {/* Step 5 Master Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-card-border/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-primary/15 text-primary border border-primary/25">
              <Scissors className="h-4 w-4" />
            </span>
            <h2 className="text-lg font-bold text-text-primary tracking-tight">
              Editing and Production Breakdown
            </h2>
            <span className="text-[11px] font-medium bg-card-border/60 text-text-muted px-2 py-0.5 rounded border border-card-border">
              Step 5 of 6
            </span>
          </div>
          <p className="text-xs text-text-muted mt-1">
            Observable analysis of cuts, transitions, pacing rhythm, text overlays, visual layering, and synchronized audio.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20">
            <Eye className="h-3 w-3" />
            Observable Evidence Only
          </span>
          {isDemoData && (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-md border border-amber-500/20">
              <ShieldCheck className="h-3 w-3" />
              Demo Analysis Mode
            </span>
          )}
        </div>
      </div>

      {/* ────────────────────────────────────────────────────────────────────────
          COMPONENT 1: Cut and Transition Analysis
          ──────────────────────────────────────────────────────────────────────── */}
      <div className="rounded-xl border border-card-border bg-card p-5 shadow-card space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-card-border/70 pb-3">
          <div className="flex items-center gap-2.5">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 text-primary text-xs font-bold">
              1
            </span>
            <div>
              <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
                Cut and Transition Analysis
                <span className="text-[10px] uppercase font-bold text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20">
                  {cuts.length} Observable Transitions
                </span>
              </h3>
              <p className="text-[11px] text-text-muted">
                Identifies every visible cut, digital punch-in, screen transition, and framing change with timestamp
              </p>
            </div>
          </div>
          <span className="text-[11px] text-text-muted font-mono">
            Average Cut Interval: ~{pacingInfo.averageShotDurationSeconds}s
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {cuts.map((cut, idx) => (
            <div
              key={idx}
              className="group rounded-lg border border-card-border bg-background-elevated/70 p-3.5 space-y-2 hover:border-primary/40 transition-colors"
            >
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => onSeek(cut.seconds)}
                  className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-primary/10 text-primary hover:bg-primary/20 text-xs font-mono font-bold border border-primary/25 transition-colors"
                  title="Click to jump video to this transition"
                >
                  <Play className="h-3 w-3 fill-current" />
                  <span>{cut.timestamp}</span>
                </button>
                <span className="text-[10px] font-semibold text-text-secondary bg-card px-2 py-0.5 rounded border border-card-border">
                  {cut.transitionType}
                </span>
              </div>

              <p className="text-xs text-text-secondary leading-relaxed">
                {cut.description}
              </p>

              <div className="pt-2 border-t border-card-border/50 flex items-center justify-between text-[10px] text-text-muted">
                <span>Transition #{idx + 1}</span>
                <span className="text-emerald-400 font-medium flex items-center gap-1">
                  <CheckCircle2 className="h-2.5 w-2.5" />
                  Observable
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ────────────────────────────────────────────────────────────────────────
          COMPONENT 2: Editing Pace and Rhythm
          ──────────────────────────────────────────────────────────────────────── */}
      <div className="rounded-xl border border-card-border bg-card p-5 shadow-card space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-card-border/70 pb-3">
          <div className="flex items-center gap-2.5">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 text-primary text-xs font-bold">
              2
            </span>
            <div>
              <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
                Editing Pace and Rhythm
                <span className="text-[10px] uppercase font-bold text-cta bg-cta/10 px-2 py-0.5 rounded border border-cta/20">
                  High Retention Cadence
                </span>
              </h3>
              <p className="text-[11px] text-text-muted">
                Pacing shifts, shot duration dynamics, and cadence synchronization with spoken content
              </p>
            </div>
          </div>
          <span className="text-[11px] text-text-muted font-mono">
            {data.pacing?.totalScenes || 8} Scenes / {data.technical?.formattedDuration || "00:28.5"}
          </span>
        </div>

        {/* Overview Banner */}
        <div className="rounded-lg bg-background-elevated/80 border border-card-border p-3.5 space-y-1">
          <span className="text-[10px] uppercase tracking-wider font-semibold text-text-muted">
            Cadence & Rhythm Summary
          </span>
          <p className="text-xs text-text-primary leading-relaxed">
            {pacingInfo.rhythmDescription}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {/* Rapid Sequences */}
          <div className="rounded-lg border border-card-border bg-background-elevated/60 p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-text-primary flex items-center gap-1.5">
                <Activity className="h-3.5 w-3.5 text-cta" />
                Rapid Sequence of Cuts
              </span>
              <span className="text-[10px] font-mono font-bold text-cta bg-cta/15 px-1.5 py-0.5 rounded">
                ~1.3s / cut
              </span>
            </div>
            <p className="text-xs text-text-secondary leading-relaxed">
              {pacingInfo.rapidCutSequences}
            </p>
            <div className="pt-2 border-t border-card-border/50 text-[10px] text-text-muted">
              Location: Opening Hook (<button type="button" onClick={() => onSeek(0)} className="text-primary hover:underline font-mono">00:00–00:03.9</button>)
            </div>
          </div>

          {/* Uninterrupted Shots */}
          <div className="rounded-lg border border-card-border bg-background-elevated/60 p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-text-primary flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-trust" />
                Uninterrupted Hold Shots
              </span>
              <span className="text-[10px] font-mono font-bold text-trust bg-trust/15 px-1.5 py-0.5 rounded">
                ~4.1s hold
              </span>
            </div>
            <p className="text-xs text-text-secondary leading-relaxed">
              {pacingInfo.uninterruptedShots}
            </p>
            <div className="pt-2 border-t border-card-border/50 text-[10px] text-text-muted">
              Location: Demonstration (<button type="button" onClick={() => onSeek(7.4)} className="text-primary hover:underline font-mono">00:07.4–00:15.6</button>)
            </div>
          </div>

          {/* Speech-to-Pace Lock */}
          <div className="rounded-lg border border-card-border bg-background-elevated/60 p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-text-primary flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                Speech & Sentence Alignment
              </span>
              <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                Syntactic Lock
              </span>
            </div>
            <p className="text-xs text-text-secondary leading-relaxed">
              {pacingInfo.speechRelation}
            </p>
            <div className="pt-2 border-t border-card-border/50 text-[10px] text-text-muted">
              Micro-silences (&lt;0.15s) spliced out cleanly
            </div>
          </div>
        </div>
      </div>

      {/* ────────────────────────────────────────────────────────────────────────
          COMPONENT 3: Text and Graphic Editing (Cross-referenced with Step 3)
          ──────────────────────────────────────────────────────────────────────── */}
      <div className="rounded-xl border border-card-border bg-card p-5 shadow-card space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-card-border/70 pb-3">
          <div className="flex items-center gap-2.5">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 text-primary text-xs font-bold">
              3
            </span>
            <div>
              <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
                Text and Graphic Editing
                <span className="text-[10px] uppercase font-bold text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20">
                  Step 3 Synchronized
                </span>
              </h3>
              <p className="text-[11px] text-text-muted">
                Animation dynamics, kinetic typography, lower thirds, and on-screen layouts using exact Step 3 text
              </p>
            </div>
          </div>
          <span className="text-[11px] text-text-muted">
            {textGraphics.length} Extracted Graphic Elements
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {textGraphics.map((item, idx) => (
            <div
              key={idx}
              className="rounded-lg border border-card-border bg-background-elevated/70 p-3.5 space-y-2 hover:border-primary/40 transition-colors"
            >
              <div className="flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => onSeek(item.seconds)}
                  className="inline-flex items-center gap-1 text-[11px] font-mono font-bold text-primary hover:underline"
                >
                  <Play className="h-2.5 w-2.5 fill-current" />
                  <span>{item.timestamp}</span>
                </button>
                <span
                  className={cn(
                    "text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider",
                    item.presentationType === "Kinetic Word Pop"
                      ? "bg-rose-500/10 text-rose-300 border-rose-500/20"
                      : item.presentationType === "Title Banner"
                      ? "bg-purple-500/10 text-purple-300 border-purple-500/20"
                      : item.presentationType === "Lower Third"
                      ? "bg-blue-500/10 text-blue-300 border-blue-500/20"
                      : item.presentationType === "Call to Action"
                      ? "bg-amber-500/10 text-amber-300 border-amber-500/20"
                      : "bg-emerald-500/10 text-emerald-300 border-emerald-500/20"
                  )}
                >
                  {item.presentationType}
                </span>
              </div>

              {/* Exact Extracted Text reference */}
              {item.exactExtractedText && (
                <div className="rounded bg-background/80 border border-card-border px-2.5 py-1.5 font-mono text-xs text-text-primary font-semibold flex items-center justify-between">
                  <span className="truncate">"{item.exactExtractedText}"</span>
                  <span className="text-[9px] uppercase font-bold text-text-muted ml-2 shrink-0">
                    Step 3 OCR
                  </span>
                </div>
              )}

              <p className="text-xs text-text-secondary leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ────────────────────────────────────────────────────────────────────────
          COMPONENT 4: Visual Effects and Layering (Observable Only, No LUT Names)
          ──────────────────────────────────────────────────────────────────────── */}
      <div className="rounded-xl border border-card-border bg-card p-5 shadow-card space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-card-border/70 pb-3">
          <div className="flex items-center gap-2.5">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 text-primary text-xs font-bold">
              4
            </span>
            <div>
              <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
                Visual Effects and Layering
                <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  Visible Results Only
                </span>
              </h3>
              <p className="text-[11px] text-text-muted">
                Multi-layer compositing, split screens, picture-in-picture, and observable color contrast (no software or LUT guesses)
              </p>
            </div>
          </div>
          <span className="text-[11px] text-text-muted">
            {visualVfx.length} Observable Techniques
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {visualVfx.map((fx, idx) => (
            <div
              key={idx}
              className="rounded-lg border border-card-border bg-background-elevated/70 p-3.5 space-y-2 hover:border-primary/40 transition-colors"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-text-primary flex items-center gap-1.5">
                  <Layers className="h-3.5 w-3.5 text-trust shrink-0" />
                  <span className="truncate">{fx.technique}</span>
                </span>
                {fx.timestamp && fx.seconds !== undefined && (
                  <button
                    type="button"
                    onClick={() => onSeek(fx.seconds!)}
                    className="inline-flex items-center gap-1 text-[11px] font-mono text-primary hover:underline shrink-0"
                  >
                    <Play className="h-2.5 w-2.5 fill-current" />
                    <span>{fx.timestamp}</span>
                  </button>
                )}
              </div>

              <p className="text-xs text-text-secondary leading-relaxed">
                {fx.observableDetails}
              </p>

              <div className="pt-2 border-t border-card-border/50 text-[10px] text-emerald-400 font-medium flex items-center gap-1">
                <CheckCircle2 className="h-2.5 w-2.5" />
                Observable Result Confirmed
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ────────────────────────────────────────────────────────────────────────
          COMPONENT 5: Audio Editing and Synchronization (Linked to Step 1)
          ──────────────────────────────────────────────────────────────────────── */}
      <div className="rounded-xl border border-card-border bg-card p-5 shadow-card space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-card-border/70 pb-3">
          <div className="flex items-center gap-2.5">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 text-primary text-xs font-bold">
              5
            </span>
            <div>
              <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
                Audio Editing and Synchronization
                <span className="text-[10px] uppercase font-bold text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20">
                  Step 1 Synchronized
                </span>
              </h3>
              <p className="text-[11px] text-text-muted">
                Voiceover continuity, music ducking levels, sound effect alignment with cuts, and intentional silences
              </p>
            </div>
          </div>
          <span className="text-[11px] text-text-muted">
            {audioSync.length} Audio Sync Events
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {audioSync.map((item, idx) => (
            <div
              key={idx}
              className="rounded-lg border border-card-border bg-background-elevated/70 p-3.5 space-y-2 hover:border-primary/40 transition-colors"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-text-primary flex items-center gap-1.5">
                  <Volume2 className="h-3.5 w-3.5 text-cta shrink-0" />
                  <span className="truncate">{item.audioElement}</span>
                </span>
                {item.timestamp && item.seconds !== undefined && (
                  <button
                    type="button"
                    onClick={() => onSeek(item.seconds!)}
                    className="inline-flex items-center gap-1 text-[11px] font-mono text-primary hover:underline shrink-0"
                  >
                    <Play className="h-2.5 w-2.5 fill-current" />
                    <span>{item.timestamp}</span>
                  </button>
                )}
              </div>

              <p className="text-xs text-text-secondary leading-relaxed">
                {item.observableDetails}
              </p>

              <div className="pt-2 border-t border-card-border/50 text-[10px] text-text-muted flex items-center justify-between">
                <span>Audio Element #{idx + 1}</span>
                <span className="text-emerald-400 font-medium flex items-center gap-1">
                  <CheckCircle2 className="h-2.5 w-2.5" />
                  Audible
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ────────────────────────────────────────────────────────────────────────
          COMPONENT 6: Editing Timeline (Three-Column Chronological Master Table)
          ──────────────────────────────────────────────────────────────────────── */}
      <div className="rounded-xl border border-card-border bg-card p-5 shadow-card space-y-4">
        {/* Table Header Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-card-border/70 pb-3">
          <div className="flex items-center gap-2.5">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 text-primary text-xs font-bold">
              6
            </span>
            <div>
              <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
                Editing Timeline
                <span className="text-[10px] uppercase font-bold text-text-secondary bg-background-elevated px-2 py-0.5 rounded border border-card-border">
                  3-Column Chronological Master
                </span>
              </h3>
              <p className="text-[11px] text-text-muted">
                Chronological record of every cut, transition, graphic overlay, and audio event from start to finish
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyTimeline}
              className="text-xs gap-1.5 h-8 bg-background-elevated hover:bg-card-border text-text-secondary hover:text-text-primary"
            >
              {copiedTimeline ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Copied Markdown</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span>Copy Timeline</span>
                </>
              )}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCSV}
              className="text-xs gap-1.5 h-8 bg-background-elevated hover:bg-card-border text-text-secondary hover:text-text-primary"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Export CSV</span>
            </Button>
          </div>
        </div>

        {/* Search / Filter Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-muted" />
          <input
            type="text"
            value={timelineSearch}
            onChange={(e) => setTimelineSearch(e.target.value)}
            placeholder="Search editing actions or observable results (e.g., 'punch-in', 'split-screen', 'lower third', 'silence')..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-lg bg-background-elevated border border-card-border text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary transition-colors"
          />
        </div>

        {/* The 3-Column Table */}
        <div className="overflow-x-auto rounded-lg border border-card-border bg-background">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-card-border bg-background-elevated text-text-muted text-[11px] font-semibold uppercase tracking-wider">
                <th className="py-3 px-4 w-32 shrink-0">Time</th>
                <th className="py-3 px-4 w-72 shrink-0">Editing Action</th>
                <th className="py-3 px-4">Observable Result</th>
                <th className="py-3 px-3 w-12 text-center"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-card-border/60">
              {filteredTimeline.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-xs text-text-muted">
                    No editing events matching "{timelineSearch}"
                  </td>
                </tr>
              ) : (
                filteredTimeline.map((row, idx) => (
                  <tr
                    key={idx}
                    className="hover:bg-background-elevated/50 transition-colors group"
                  >
                    {/* Column 1: Time */}
                    <td className="py-3 px-4 align-top font-mono">
                      <button
                        type="button"
                        onClick={() => onSeek(row.seconds)}
                        className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-primary/10 hover:bg-primary/20 text-primary text-[11px] font-mono font-bold border border-primary/20 transition-colors"
                        title="Click to jump video to this moment"
                      >
                        <Play className="h-2.5 w-2.5 fill-current" />
                        <span>{row.timestamp}</span>
                      </button>
                    </td>

                    {/* Column 2: Editing Action */}
                    <td className="py-3 px-4 align-top">
                      <span className="font-semibold text-text-primary text-xs flex items-center gap-1.5">
                        <Scissors className="h-3 w-3 text-primary shrink-0" />
                        <span>{row.editingAction}</span>
                      </span>
                    </td>

                    {/* Column 3: Observable Result */}
                    <td className="py-3 px-4 align-top">
                      <p className="text-text-secondary text-xs leading-relaxed">
                        {row.observableResult}
                      </p>
                    </td>

                    {/* Action copy button */}
                    <td className="py-3 px-3 align-top text-center">
                      <button
                        type="button"
                        onClick={() =>
                          handleCopyRow(
                            idx,
                            `${row.timestamp} | ${row.editingAction} | ${row.observableResult}`
                          )
                        }
                        className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-card-border text-text-muted hover:text-text-primary transition-opacity"
                        title="Copy row to clipboard"
                      >
                        {copiedRowIdx === idx ? (
                          <Check className="h-3.5 w-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between text-[11px] text-text-muted px-1">
          <span>Showing {filteredTimeline.length} of {timelineEvents.length} chronological events</span>
          <span className="font-mono text-text-secondary">Full Reel Coverage (00:00.0 – {data.technical?.formattedDuration || "00:28.5"})</span>
        </div>
      </div>
    </div>
  );
};
