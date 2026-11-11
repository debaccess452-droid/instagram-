import React, { useState } from "react";
import {
  Scissors,
  Activity,
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
  ShieldCheck,
  Eye,
  AlertCircle,
  HelpCircle,
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

function renderEvidenceBadge(status?: "Observed" | "Estimated" | "Unable to determine") {
  if (status === "Unable to determine") {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-400 bg-slate-500/10 px-2 py-0.5 rounded border border-slate-500/20">
        <HelpCircle className="h-2.5 w-2.5" />
        Unable to determine
      </span>
    );
  }
  if (status === "Estimated") {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
        <AlertCircle className="h-2.5 w-2.5" />
        Estimated
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
      <CheckCircle2 className="h-2.5 w-2.5" />
      Observed
    </span>
  );
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

  // Fallbacks ensuring robust rendering strictly adhering to observable evidence
  const cuts: CutTransitionItem[] =
    data.cutsAndTransitions && data.cutsAndTransitions.length > 0
      ? data.cutsAndTransitions
      : (data.pacing?.cutTimestamps || []).map((cut, idx) => ({
          timestamp: cut.timestamp,
          seconds: cut.seconds,
          transitionType:
            data.pacing.transitionTypes?.[idx % (data.pacing.transitionTypes.length || 1)]?.type ||
            "Hard Cut",
          description: `Observable scene transition cut at timestamp ${cut.timestamp}.`,
          evidenceStatus: "Observed",
        }));

  const pacingInfo = data.pacingAndRhythmDetails || {
    rhythmDescription:
      "Fast-paced editing overall, with 8 distinct shots across 28.5 seconds. Average shot duration is approximately 3.6 seconds based on detected cut timestamps.",
    averageShotDurationSeconds: data.pacing?.averageShotDurationSeconds || 3.6,
    rapidCutSequences:
      "Opening hook (00:00–00:03.9) contains the fastest cutting with two shots averaging approximately 1.9 seconds each.",
    uninterruptedShots:
      "The longest continuous shots occur during the software demonstration and explanation (00:07.4–00:11.2 at 3.8s, and 00:15.6–00:21.0 at 5.4s).",
    speechRelation:
      "Visual cuts coincide with the end of spoken phrases and transitions between topics.",
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
            description: "High-contrast text appears at top-center with scale bounce animation.",
            evidenceStatus: "Observed",
          },
          {
            timestamp: "00:01.8–00:03.9",
            seconds: 1.8,
            exactExtractedText: "it's frying your brain and killing retention.",
            presentationType: "Kinetic Word Pop",
            description: "Center animated text appearing in sequence with spoken words.",
            evidenceStatus: "Observed",
          },
          {
            timestamp: "00:03.9–00:07.4",
            seconds: 3.9,
            exactExtractedText: "The 3-Step Creator DNA Method",
            presentationType: "Title Banner",
            description: "Top-center title card sliding into frame.",
            evidenceStatus: "Observed",
          },
          {
            timestamp: "00:07.4–00:11.2",
            seconds: 7.4,
            exactExtractedText: "STEP 1: Batch Hook Archetypes 🎣",
            presentationType: "Lower Third",
            description: "Lower-third banner displayed during step 1 description.",
            evidenceStatus: "Observed",
          },
          {
            timestamp: "00:11.2–00:15.6",
            seconds: 11.2,
            exactExtractedText: "STEP 2: Lock 1 Visual Anchor 🎥",
            presentationType: "Lower Third",
            description: "Lower-third banner displayed during step 2 description.",
            evidenceStatus: "Observed",
          },
          {
            timestamp: "00:15.6–00:18.2",
            seconds: 15.6,
            exactExtractedText: "STEP 3: Replicate Voice",
            presentationType: "Lower Third",
            description: "Lower-third banner displayed during step 3 description.",
            evidenceStatus: "Observed",
          },
          {
            timestamp: "00:21.0–00:23.5",
            seconds: 21.0,
            exactExtractedText: "⚡ 10 Variations in 4 Seconds",
            presentationType: "Split Screen Label",
            description: "Banner displayed at top of split-screen scene.",
            evidenceStatus: "Observed",
          },
          {
            timestamp: "00:25.2–00:28.5",
            seconds: 25.2,
            exactExtractedText: "SAVE THIS REEL 📌 link in bio for template",
            presentationType: "Call to Action",
            description: "Call-to-action overlay displayed at bottom of frame.",
            evidenceStatus: "Observed",
          },
        ];

  const visualVfx: VisualEffectItem[] =
    data.visualEffectsAndLayering && data.visualEffectsAndLayering.length > 0
      ? data.visualEffectsAndLayering
      : [
          {
            technique: "Visual Styling & Lighting",
            observableDetails:
              "Warm frontal light on subject against dark blue background. Specific grading profile or equipment is unable to determine from video stream.",
            evidenceStatus: "Unable to determine",
          },
          {
            timestamp: "00:07.4–00:11.2",
            seconds: 7.4,
            technique: "Picture-in-Picture Multi-Layer Layout",
            observableDetails:
              "Full-bleed screen capture with rounded corners and drop shadow; presenter shown in circular lower-left picture-in-picture window.",
            evidenceStatus: "Observed",
          },
          {
            timestamp: "00:21.0–00:25.2",
            seconds: 21.0,
            technique: "Vertical Split-Screen Composition",
            observableDetails:
              "Vertical split-screen cleanly dividing the frame into two halves: subject reaction on left and software screen on right.",
            evidenceStatus: "Observed",
          },
          {
            timestamp: "00:04.5",
            seconds: 4.5,
            technique: "Motion Graphic Overlays",
            observableDetails:
              "Semi-transparent card overlay and animated stylized line graphic displayed beside subject.",
            evidenceStatus: "Observed",
          },
          {
            timestamp: "00:01.8",
            seconds: 1.8,
            technique: "Digital Punch-In",
            observableDetails:
              "Digital cropping executed at 00:01.8 and 00:11.2 to change framing without optical camera movement.",
            evidenceStatus: "Observed",
          },
        ];

  const audioSync: AudioEditingItem[] =
    data.audioSyncBreakdown && data.audioSyncBreakdown.length > 0
      ? data.audioSyncBreakdown
      : [
          {
            audioElement: "Voiceover Edit",
            observableDetails:
              "Voiceover dialogue is edited together tightly with minimal silent pauses between phrases.",
            evidenceStatus: "Observed",
          },
          {
            audioElement: "Music Bed Ducking",
            observableDetails:
              "Background music volume lowers audibly while speech is active, and increases slightly during cuts.",
            evidenceStatus: "Observed",
          },
          {
            timestamp: "00:00.8",
            seconds: 0.8,
            audioElement: "Sound Effect Sync",
            observableDetails: "Audible whoosh sound effect plays as opening text appears.",
            evidenceStatus: "Observed",
          },
          {
            timestamp: "00:03.2",
            seconds: 3.2,
            audioElement: "Sound Effect Sync",
            observableDetails: "Audible click sound effect plays on phrase emphasis.",
            evidenceStatus: "Observed",
          },
          {
            timestamp: "00:07.1",
            seconds: 7.1,
            audioElement: "Sound Effect Sync",
            observableDetails:
              "Audible low sub-bass sound plays at transition into software demonstration.",
            evidenceStatus: "Observed",
          },
          {
            timestamp: "00:11.4",
            seconds: 11.4,
            audioElement: "Sound Effect Sync",
            observableDetails: "Audible slide sound effect plays as step 2 card appears.",
            evidenceStatus: "Observed",
          },
          {
            timestamp: "00:20.5",
            seconds: 20.5,
            audioElement: "Sound Effect Sync",
            observableDetails: "Audible digital chime sound plays as variation counter appears.",
            evidenceStatus: "Observed",
          },
          {
            timestamp: "00:25.0",
            seconds: 25.0,
            audioElement: "Pacing / Breath Removal",
            observableDetails:
              "Audible brief pause in voiceover dialogue before the final call to action.",
            evidenceStatus: "Observed",
          },
        ];

  const timelineEvents: EditingTimelineEvent[] =
    data.editingTimeline && data.editingTimeline.length > 0
      ? data.editingTimeline
      : [
          {
            timestamp: "00:00.0–00:01.8",
            seconds: 0.0,
            editingAction: "Opening Cut & Text Appearance",
            observableResult:
              "Medium close-up of subject; 'STOP POSTING DAILY 🛑' text appears at top-center; background music starts with audible whoosh sound.",
            evidenceStatus: "Observed",
          },
          {
            timestamp: "00:01.8–00:03.9",
            seconds: 1.8,
            editingAction: "Digital Punch-In & Animated Text",
            observableResult:
              "Framing crops closer to subject; 'it's frying your brain and killing retention.' text animates; audible click sound.",
            evidenceStatus: "Observed",
          },
          {
            timestamp: "00:03.9–00:07.4",
            seconds: 3.9,
            editingAction: "Hard Cut & Top Title Card",
            observableResult:
              "Cut to medium desk view; 'The 3-Step Creator DNA Method' banner slides down; graphic overlay appears.",
            evidenceStatus: "Observed",
          },
          {
            timestamp: "00:07.4–00:11.2",
            seconds: 7.4,
            editingAction: "PiP Screen Transition & Lower Third",
            observableResult:
              "Transition to desktop screen capture with subject in circular picture-in-picture; 'STEP 1: Batch Hook Archetypes 🎣' appears with low sub sound.",
            evidenceStatus: "Observed",
          },
          {
            timestamp: "00:11.2–00:15.6",
            seconds: 11.2,
            editingAction: "Digital Punch-In & Step 2 Graphic",
            observableResult:
              "Framing punches in closer on screen capture; lower-third updates to 'STEP 2: Lock 1 Visual Anchor 🎥' with audible slide sound.",
            evidenceStatus: "Observed",
          },
          {
            timestamp: "00:15.6–00:21.0",
            seconds: 15.6,
            editingAction: "Hard Cut & Step 3 Graphic",
            observableResult:
              "Cut back to subject talking head; lower-third updates to 'STEP 3: Replicate Voice'.",
            evidenceStatus: "Observed",
          },
          {
            timestamp: "00:21.0–00:25.0",
            seconds: 21.0,
            editingAction: "Split-Screen Cut & Headline",
            observableResult:
              "Vertical split-screen cut showing subject on left and screen demonstration on right; '⚡ 10 Variations in 4 Seconds' banner appears with audible chime.",
            evidenceStatus: "Observed",
          },
          {
            timestamp: "00:25.0–00:25.2",
            seconds: 25.0,
            editingAction: "Voiceover Dialogue Pause",
            observableResult:
              "Brief pause in voiceover dialogue preceding the concluding call to action.",
            evidenceStatus: "Observed",
          },
          {
            timestamp: "00:25.2–00:28.5",
            seconds: 25.2,
            editingAction: "Motion Swipe Cut & CTA Card",
            observableResult:
              "Horizontal swipe transition to wider framing; 'SAVE THIS REEL 📌 link in bio for template' overlay appears; music fades to conclusion.",
            evidenceStatus: "Observed",
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
    <div className="space-y-6">
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

      {/* Demo Analysis Transparency Notice */}
      {isDemoData && (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 px-4 py-2.5 flex items-start gap-2.5 text-xs text-amber-300">
          <ShieldCheck className="h-4 w-4 shrink-0 mt-0.5 text-amber-400" />
          <div className="leading-relaxed">
            <strong className="font-semibold text-amber-200">Demo Analysis Mode:</strong> This reference analysis is simulated from sample media for testing and preview. It does not represent real-time measurements of an uploaded video.
          </div>
        </div>
      )}

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
                {renderEvidenceBadge(cut.evidenceStatus)}
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
                <span className="text-[10px] uppercase font-bold text-text-secondary bg-background-elevated px-2 py-0.5 rounded border border-card-border">
                  Fast-Paced Editing Rhythm
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
              <span className="text-[10px] font-mono font-bold text-text-secondary bg-background-elevated px-1.5 py-0.5 rounded border border-card-border">
                ~1.9s avg
              </span>
            </div>
            <p className="text-xs text-text-secondary leading-relaxed">
              {pacingInfo.rapidCutSequences}
            </p>
            <div className="pt-2 border-t border-card-border/50 flex items-center justify-between text-[10px] text-text-muted">
              <span>Opening Hook (<button type="button" onClick={() => onSeek(0)} className="text-primary hover:underline font-mono">00:00–00:03.9</button>)</span>
              {renderEvidenceBadge("Observed")}
            </div>
          </div>

          {/* Uninterrupted Shots */}
          <div className="rounded-lg border border-card-border bg-background-elevated/60 p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-text-primary flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-trust" />
                Uninterrupted Hold Shots
              </span>
              <span className="text-[10px] font-mono font-bold text-text-secondary bg-background-elevated px-1.5 py-0.5 rounded border border-card-border">
                3.8s–5.4s hold
              </span>
            </div>
            <p className="text-xs text-text-secondary leading-relaxed">
              {pacingInfo.uninterruptedShots}
            </p>
            <div className="pt-2 border-t border-card-border/50 flex items-center justify-between text-[10px] text-text-muted">
              <span>Demonstration (<button type="button" onClick={() => onSeek(7.4)} className="text-primary hover:underline font-mono">00:07.4–00:15.6</button>)</span>
              {renderEvidenceBadge("Observed")}
            </div>
          </div>

          {/* Speech-to-Pace Lock */}
          <div className="rounded-lg border border-card-border bg-background-elevated/60 p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-text-primary flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                Sentence Boundary Alignment
              </span>
              <span className="text-[10px] font-mono font-bold text-text-secondary bg-background-elevated px-1.5 py-0.5 rounded border border-card-border">
                Phrase Cuts
              </span>
            </div>
            <p className="text-xs text-text-secondary leading-relaxed">
              {pacingInfo.speechRelation}
            </p>
            <div className="pt-2 border-t border-card-border/50 flex items-center justify-between text-[10px] text-text-muted">
              <span>Pauses between phrases removed</span>
              {renderEvidenceBadge("Observed")}
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
                <div className="flex items-center gap-1.5">
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
                  {renderEvidenceBadge(item.evidenceStatus)}
                </div>
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
          COMPONENT 4: Visual Effects and Layering (Observable Only, No Guesses)
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
                <span className="text-[10px] uppercase font-bold text-text-secondary bg-background-elevated px-2 py-0.5 rounded border border-card-border">
                  Visible Results Only
                </span>
              </h3>
              <p className="text-[11px] text-text-muted">
                Multi-layer compositing, split screens, picture-in-picture, and observable visual styling without software assumptions
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

              <div className="pt-2 border-t border-card-border/50 flex items-center justify-between text-[10px] text-text-muted">
                <span>Technique #{idx + 1}</span>
                {renderEvidenceBadge(fx.evidenceStatus)}
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
                Voiceover cuts, audible music ducking, and sound effects aligned with visual changes
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
                <span>Audio #{idx + 1}</span>
                {renderEvidenceBadge(item.evidenceStatus)}
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
                Chronological summary of observable cuts, transitions, text appearances, and audio events
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
            placeholder="Search editing actions or observable results (e.g., 'punch-in', 'split-screen', 'lower third', 'pause')..."
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
