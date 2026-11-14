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
  ShieldAlert,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import {
  VisualAnalysisData,
  VisualScene,
  VisualBackendResult,
  VisualBackendScene,
  VisualAnalysisStatus,
  VisualGeminiStep1Result,
  VisualGeminiOutfitChange,
  VisualStep1Status,
  VisualStep2Status,
  VisualFrameRequest,
  VisualFrameSelectionStatus,
  FramePathItem,
  VisualSamplingMetadata,
} from "../types/analysis";
import { Button } from "@/components/buttons";
import { cn } from "@/utils/cn";

export interface VisualAnalysisProps {
  data?: VisualAnalysisData; // benchmark demo data fallback
  realData?: VisualBackendResult | null; // real Supabase Edge Function result
  geminiStep1Data?: VisualGeminiStep1Result | null;
  groqStep2Data?: VisualBackendResult | Record<string, unknown> | null;
  step1Status?: VisualStep1Status | null;
  step2Status?: VisualStep2Status | null;
  frameRequests?: VisualFrameRequest[];
  frameSelectionStatus?: VisualFrameSelectionStatus | null;
  guidedFrameMessage?: string | null;
  guidedFrameError?: string | null;
  isUploadingGuidedFrames?: boolean;
  onRetryFrameSelection?: () => void;
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
  samplingMetadata?: VisualSamplingMetadata | null;
  videoDurationSeconds?: number | null;
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

/**
 * Format raw seconds to MM:SS.mmm (or HH:MM:SS.mmm) string for precision look timelines
 */
function formatSecondsToPreciseTimestamp(seconds: number): string {
  if (typeof seconds !== "number" || isNaN(seconds) || seconds < 0) return "00:00.000";
  const totalMs = Math.round(seconds * 1000);
  const hrs = Math.floor(totalMs / 3_600_000);
  const mins = Math.floor((totalMs % 3_600_000) / 60_000);
  const secs = Math.floor((totalMs % 60_000) / 1000);
  const ms = totalMs % 1000;
  const base = `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}.${ms
    .toString()
    .padStart(3, "0")}`;
  return hrs > 0 ? `${hrs.toString().padStart(2, "0")}:${base}` : base;
}

function formatTimeRange(start: number, end: number): string {
  return `${formatSecondsToTimestamp(start)}–${formatSecondsToTimestamp(end)}`;
}

function formatPreciseTimeRange(start: number, end: number): string {
  if (Math.abs(start - end) < 0.001) {
    return formatSecondsToPreciseTimestamp(start);
  }
  return `${formatSecondsToPreciseTimestamp(start)}–${formatSecondsToPreciseTimestamp(end)}`;
}

function parseFlexibleSeconds(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value) && value >= 0) {
    return value;
  }
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return null;
    if (trimmed.includes(":")) {
      const parts = trimmed.split(":").map((p) => Number(p));
      if (parts.length === 2 && parts.every((n) => Number.isFinite(n) && n >= 0)) {
        return parts[0] * 60 + parts[1];
      }
      if (parts.length === 3 && parts.every((n) => Number.isFinite(n) && n >= 0)) {
        return parts[0] * 3600 + parts[1] * 60 + parts[2];
      }
    }
    const numeric = Number(trimmed.replace(/s$/i, ""));
    if (Number.isFinite(numeric) && numeric >= 0) {
      return numeric;
    }
  }
  return null;
}

function formatOutfitDetailValue(value: unknown): string | null {
  if (!value) return null;
  if (Array.isArray(value)) {
    const cleaned = value.map((v) => String(v || "").trim()).filter(Boolean);
    return cleaned.length > 0 ? cleaned.join(", ") : null;
  }
  const str = String(value).trim();
  return str.length > 0 ? str : null;
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

interface SynthesizedVisualShot {
  shotNumber: number;
  startSec: number;
  endSec: number | null;
  timestampLabel: string;
  description: string;
  geminiNotes: string | null;
  groqEnrichment: string | null;
  matchedFrameCount: number;
  sourceKind: "gemini_plus_groq" | "gemini_only" | "groq_grouped";
  hairstyleNote: string | null;
  warnings: string[];
}

function normalizeComparisonText(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function isPhraseCoveredInText(candidate: string, baseText: string): boolean {
  const normCandidate = normalizeComparisonText(candidate);
  const normBase = normalizeComparisonText(baseText);
  if (!normCandidate) return true;
  if (!normBase) return false;
  if (normBase.includes(normCandidate)) return true;

  const words = normCandidate.split(" ").filter((w) => w.length > 2);
  if (words.length === 0) return true;
  const matchedWords = words.filter((w) => normBase.includes(w));
  return matchedWords.length / words.length >= 0.78;
}

function dedupeConciseSentences(items: string[]): string[] {
  const seen: string[] = [];
  const result: string[] = [];

  for (const raw of items) {
    const cleaned = raw.trim().replace(/\s+/g, " ");
    if (!cleaned) continue;
    const isDup = seen.some(
      (prev) =>
        isPhraseCoveredInText(cleaned, prev) || isPhraseCoveredInText(prev, cleaned)
    );
    if (!isDup) {
      seen.push(cleaned);
      result.push(cleaned);
    }
  }

  return result;
}

function ensureSentencePunctuation(text: string): string {
  const trimmed = text.trim();
  if (!trimmed) return "";
  return /[.!?]$/.test(trimmed) ? trimmed : `${trimmed}.`;
}

function formatShotNumberList(nums: number[]): string {
  if (nums.length === 0) return "";
  if (nums.length === 1) return `${nums[0]}`;
  if (nums.length === 2) return `${nums[0]} and ${nums[1]}`;
  return `${nums.slice(0, -1).join(", ")}, and ${nums[nums.length - 1]}`;
}

function buildSynthesizedShots(
  geminiChanges: VisualGeminiOutfitChange[],
  groqScenes: VisualBackendScene[]
): SynthesizedVisualShot[] {
  const sortedScenes = [...groqScenes].sort(
    (a, b) => (a.start_time_seconds ?? 0) - (b.start_time_seconds ?? 0)
  );

  if (geminiChanges.length > 0) {
    const parsedLooks = geminiChanges
      .map((item, idx) => {
        const lookNum = item.look_number ?? item.outfit_number ?? idx + 1;
        const startSec = parseFlexibleSeconds(
          item.start_time ??
            item.start_time_seconds ??
            item.estimated_start_time_seconds ??
            item.estimated_start_seconds ??
            item.start_timestamp
        );
        const endSec = parseFlexibleSeconds(
          item.end_time ??
            item.end_time_seconds ??
            item.estimated_end_time_seconds ??
            item.estimated_end_seconds ??
            item.end_timestamp
        );
        return { item, idx, lookNum, startSec, endSec };
      })
      .sort((a, b) => {
        const sa = a.startSec ?? Number.MAX_SAFE_INTEGER;
        const sb = b.startSec ?? Number.MAX_SAFE_INTEGER;
        if (sa !== sb) return sa - sb;
        return a.lookNum - b.lookNum;
      });

    // Map each Groq sampled-frame observation to at most ONE matching Gemini look
    const matchedByLookIndex = new Map<number, VisualBackendScene[]>();
    parsedLooks.forEach((_, idx) => matchedByLookIndex.set(idx, []));

    for (const scene of sortedScenes) {
      const sStart = Number(scene.start_time_seconds ?? 0);
      const sEnd = Number(scene.end_time_seconds ?? sStart);
      const sMid = (sStart + sEnd) / 2;

      let bestLookIdx = -1;
      let bestScore = -1;

      for (let i = 0; i < parsedLooks.length; i++) {
        const lStart = parsedLooks[i].startSec;
        const lEnd = parsedLooks[i].endSec ?? lStart;
        if (lStart === null || lEnd === null) continue;

        const lo = Math.min(lStart, lEnd);
        const hi = Math.max(lStart, lEnd);
        const overlap = Math.min(hi, Math.max(sStart, sEnd)) - Math.max(lo, Math.min(sStart, sEnd));

        if (overlap > 0) {
          const score = 100 + overlap;
          if (score > bestScore) {
            bestScore = score;
            bestLookIdx = i;
          }
        } else if (sMid >= lo - 0.15 && sMid <= hi + 0.15) {
          const lookMid = (lo + hi) / 2;
          const dist = Math.abs(sMid - lookMid);
          const score = 50 - dist;
          if (score > bestScore) {
            bestScore = score;
            bestLookIdx = i;
          }
        }
      }

      if (bestLookIdx === -1) {
        let closestDist = Infinity;
        for (let i = 0; i < parsedLooks.length; i++) {
          const lStart = parsedLooks[i].startSec;
          const lEnd = parsedLooks[i].endSec ?? lStart;
          if (lStart === null || lEnd === null) continue;
          const lo = Math.min(lStart, lEnd);
          const hi = Math.max(lStart, lEnd);
          const dist = sMid < lo ? lo - sMid : sMid > hi ? sMid - hi : 0;
          if (dist < closestDist && dist <= 0.45) {
            closestDist = dist;
            bestLookIdx = i;
          }
        }
      }

      if (bestLookIdx !== -1) {
        matchedByLookIndex.get(bestLookIdx)?.push(scene);
      }
    }

    return parsedLooks.map(({ item, idx, lookNum, startSec, endSec }, orderIdx) => {
      const resolvedStart = startSec ?? 0;
      const resolvedEnd = endSec;
      const timestampLabel =
        startSec !== null && resolvedEnd !== null
          ? formatPreciseTimeRange(startSec, resolvedEnd)
          : startSec !== null
          ? formatSecondsToPreciseTimestamp(startSec)
          : item.start_time || item.end_time || item.start_timestamp || item.end_timestamp
          ? item.end_time && String(item.end_time) !== String(item.start_time)
            ? `${item.start_time ?? item.start_timestamp ?? "?"}–${
                item.end_time ?? item.end_timestamp ?? "?"
              }`
            : `${item.start_time ?? item.start_timestamp ?? "?"}`
          : "00:00.000";

      const baseDesc =
        formatOutfitDetailValue(item.description ?? item.outfit_description) || "";
      const hairstyle = formatOutfitDetailValue(item.hairstyle);
      const clothing = formatOutfitDetailValue(item.clothing);
      const footwear = formatOutfitDetailValue(item.footwear);
      const accessories = formatOutfitDetailValue(item.accessories);
      const visibleEvidence = formatOutfitDetailValue(
        item.visible_evidence ?? item.evidence_notes ?? item.notes
      );

      const descParts: string[] = [];
      if (baseDesc) descParts.push(ensureSentencePunctuation(baseDesc));
      let accumulated = descParts.join(" ");

      const extraAttrs = [clothing, footwear, accessories].filter(
        (v): v is string => Boolean(v)
      );
      const unseenAttrs = extraAttrs.filter(
        (attr) => !isPhraseCoveredInText(attr, accumulated)
      );
      if (unseenAttrs.length > 0) {
        descParts.push(ensureSentencePunctuation(unseenAttrs.join(", ")));
        accumulated = descParts.join(" ");
      }

      const matchedScenes = matchedByLookIndex.get(idx) || [];
      const groqActions: string[] = [];
      const groqClothingExtras: string[] = [];

      for (const sc of matchedScenes) {
        for (const subj of sc.visible_subjects || []) {
          if (subj.visible_action && !/not clearly visible|none/i.test(subj.visible_action)) {
            groqActions.push(ensureSentencePunctuation(subj.visible_action));
          }
          if (subj.clothing && !isPhraseCoveredInText(subj.clothing, accumulated)) {
            groqClothingExtras.push(subj.clothing.trim());
          }
        }
      }

      const uniqueActions = dedupeConciseSentences(groqActions).slice(0, 2);
      const uniqueClothingExtras = dedupeConciseSentences(groqClothingExtras).slice(0, 1);

      const groqEnrichmentParts: string[] = [];
      if (uniqueClothingExtras.length > 0) {
        groqEnrichmentParts.push(ensureSentencePunctuation(uniqueClothingExtras.join(" ")));
      }
      if (uniqueActions.length > 0) {
        groqEnrichmentParts.push(uniqueActions.join(" "));
      }

      const groqEnrichment =
        groqEnrichmentParts.length > 0 ? groqEnrichmentParts.join(" ") : null;

      // Keep main shot description readable: include action if concise and not already in Gemini text
      const mainParts = [...descParts];
      if (
        uniqueActions.length > 0 &&
        !isPhraseCoveredInText(uniqueActions[0], accumulated)
      ) {
        mainParts.push(uniqueActions[0]);
      }

      const finalDescription =
        mainParts.join(" ").trim() ||
        groqEnrichment ||
        "Outfit appearance observed in the Reel timeline.";

      const itemWarnings = Array.isArray(item.warnings)
        ? item.warnings.filter((w) => typeof w === "string" && w.trim().length > 0)
        : [];

      return {
        shotNumber: typeof lookNum === "number" && lookNum > 0 ? lookNum : orderIdx + 1,
        startSec: resolvedStart,
        endSec: resolvedEnd,
        timestampLabel,
        description: finalDescription,
        geminiNotes:
          visibleEvidence && !isPhraseCoveredInText(visibleEvidence, finalDescription)
            ? visibleEvidence
            : null,
        groqEnrichment,
        matchedFrameCount: matchedScenes.length,
        sourceKind:
          matchedScenes.length > 0 ? "gemini_plus_groq" : "gemini_only",
        hairstyleNote: hairstyle,
        warnings: itemWarnings,
      };
    });
  }

  // Fallback when Gemini Step 1 outfit timeline is unavailable:
  // Group consecutive near-identical sampled-frame observations instead of showing 14 separate cards
  const grouped: SynthesizedVisualShot[] = [];

  for (const scene of sortedScenes) {
    const scClothing = (scene.visible_subjects || [])
      .map((s) => s.clothing)
      .filter(Boolean)
      .join(", ");
    const scAction = (scene.visible_subjects || [])
      .map((s) => s.visible_action)
      .filter(Boolean)
      .join(" ");

    const last = grouped[grouped.length - 1];
    const isSameOutfitAsPrev =
      last &&
      scClothing &&
      isPhraseCoveredInText(scClothing, last.description) &&
      isPhraseCoveredInText(last.description, scClothing + " " + (last.groqEnrichment || ""));

    if (last && isSameOutfitAsPrev) {
      last.endSec = Math.max(
        last.endSec ?? last.startSec,
        scene.end_time_seconds ?? scene.start_time_seconds ?? last.startSec
      );
      last.timestampLabel = formatPreciseTimeRange(last.startSec, last.endSec);
      last.matchedFrameCount += 1;
      if (scAction && !isPhraseCoveredInText(scAction, last.description)) {
        last.groqEnrichment = last.groqEnrichment
          ? `${last.groqEnrichment} ${ensureSentencePunctuation(scAction)}`
          : ensureSentencePunctuation(scAction);
      }
      continue;
    }

    const start = Number(scene.start_time_seconds ?? 0);
    const end = Number(scene.end_time_seconds ?? start);
    const desc = scClothing
      ? ensureSentencePunctuation(scClothing)
      : scene.scene_description || "Observed visual segment from sampled frames.";

    grouped.push({
      shotNumber: grouped.length + 1,
      startSec: start,
      endSec: end,
      timestampLabel: formatPreciseTimeRange(start, end),
      description: desc,
      geminiNotes: null,
      groqEnrichment:
        scAction && !isPhraseCoveredInText(scAction, desc)
          ? ensureSentencePunctuation(scAction)
          : null,
      matchedFrameCount: 1,
      sourceKind: "groq_grouped",
      hairstyleNote: null,
      warnings: [],
    });
  }

  return grouped;
}

function buildSubjectSummaryText(
  geminiStep1Data: VisualGeminiStep1Result | null,
  groqStep2Data: VisualBackendResult | Record<string, unknown> | null,
  realData: VisualBackendResult,
  shots: SynthesizedVisualShot[]
): string {
  const groqObj =
    groqStep2Data && typeof groqStep2Data === "object"
      ? (groqStep2Data as Record<string, unknown>)
      : null;

  const explicit =
    (typeof geminiStep1Data?.subject_summary === "string" &&
      geminiStep1Data.subject_summary.trim()) ||
    (typeof geminiStep1Data?.subject_description === "string" &&
      geminiStep1Data.subject_description.trim()) ||
    (typeof geminiStep1Data?.subject === "string" && geminiStep1Data.subject.trim()) ||
    (typeof realData.video_overview?.subject === "string" &&
      realData.video_overview.subject.trim()) ||
    (groqObj && typeof groqObj.subject === "string" && groqObj.subject.trim()) ||
    (groqObj &&
      typeof groqObj.subject_summary === "string" &&
      groqObj.subject_summary.trim()) ||
    null;

  if (explicit) return explicit;

  const scenes = realData.scenes || [];
  const rawAppearances: string[] = [];
  for (const sc of scenes) {
    for (const subj of sc.visible_subjects || []) {
      const app = String(subj.visible_appearance || "").trim();
      if (
        app &&
        !/not clearly visible|unable to determine/i.test(app) &&
        app.length > 4
      ) {
        rawAppearances.push(app);
      }
    }
  }

  const uniqueAppearances = dedupeConciseSentences(rawAppearances);
  const baseAppearance =
    uniqueAppearances.length > 0
      ? ensureSentencePunctuation(uniqueAppearances[0])
      : "";

  // Summarize hairstyle progression across chronological shots if available
  const downShots: number[] = [];
  const upShots: number[] = [];
  const otherHairNotes: string[] = [];

  for (const shot of shots) {
    const hairSource = `${shot.hairstyleNote || ""} ${shot.description}`.trim();
    if (!hairSource) continue;
    const lower = hairSource.toLowerCase();
    if (/(pulled back|updo|ponytail|bun|tied up|pinned back)/i.test(lower)) {
      upShots.push(shot.shotNumber);
    } else if (/(worn down|hair down|loose waves|in waves|voluminous waves|curls)/i.test(lower)) {
      downShots.push(shot.shotNumber);
    } else if (shot.hairstyleNote) {
      otherHairNotes.push(shot.hairstyleNote);
    }
  }

  const parts: string[] = [];
  if (baseAppearance) {
    parts.push(baseAppearance);
  }

  if (downShots.length > 0 && upShots.length > 0) {
    const combinedText = `${baseAppearance} ${shots.map((s) => s.description).join(" ")}`;
    const hairPronoun = /(woman|girl|female|\bshe\b|\bher\b)/i.test(combinedText)
      ? "Her hair"
      : "Hair";
    parts.push(
      `${hairPronoun} is worn down in ${
        downShots.length === 1 ? "shot" : "shots"
      } ${formatShotNumberList(downShots)}, and pulled back in ${
        upShots.length === 1 ? "shot" : "shots"
      } ${formatShotNumberList(upShots)}.`
    );
  } else if (otherHairNotes.length > 0) {
    const uniqueHair = dedupeConciseSentences(otherHairNotes);
    if (uniqueHair.length > 0 && !isPhraseCoveredInText(uniqueHair[0], baseAppearance)) {
      parts.push(ensureSentencePunctuation(uniqueHair[0]));
    }
  }

  if (parts.length > 0) {
    return parts.join(" ");
  }

  return "Single primary subject observed in frame; no additional appearance details recorded.";
}

function buildCameraFramingSummaryText(
  geminiStep1Data: VisualGeminiStep1Result | null,
  groqStep2Data: VisualBackendResult | Record<string, unknown> | null,
  realData: VisualBackendResult
): string {
  const groqObj =
    groqStep2Data && typeof groqStep2Data === "object"
      ? (groqStep2Data as Record<string, unknown>)
      : null;

  const explicit =
    (typeof geminiStep1Data?.camera_and_framing === "string" &&
      geminiStep1Data.camera_and_framing.trim()) ||
    (typeof geminiStep1Data?.camera_framing === "string" &&
      geminiStep1Data.camera_framing.trim()) ||
    (typeof realData.video_overview?.camera_and_framing === "string" &&
      realData.video_overview.camera_and_framing.trim()) ||
    (typeof realData.video_overview?.camera_framing === "string" &&
      realData.video_overview.camera_framing.trim()) ||
    (groqObj &&
      typeof groqObj.camera_and_framing === "string" &&
      groqObj.camera_and_framing.trim()) ||
    (groqObj &&
      typeof groqObj.camera_framing === "string" &&
      groqObj.camera_framing.trim()) ||
    null;

  if (explicit) return explicit;

  const scenes = realData.scenes || [];
  const framings = Array.from(
    new Set(
      [
        ...scenes.map((s) => s.camera?.shot_framing),
        ...(geminiStep1Data?.outfit_changes || []).map((c) => c.camera_framing),
      ]
        .map((v) => String(v || "").trim().replace(/[-_]+/g, " "))
        .filter((v) => v && !/not clearly specified|unknown/i.test(v))
    )
  );
  const angles = Array.from(
    new Set(
      scenes
        .map((s) => String(s.camera?.camera_angle || "").trim().replace(/[-_]+/g, " "))
        .filter((v) => v && !/not clearly specified|unknown/i.test(v))
    )
  );
  const movements = Array.from(
    new Set(
      scenes
        .map((s) => String(s.camera?.camera_movement || "").trim().replace(/[-_]+/g, " "))
        .filter((v) => v && !/not clearly specified|unknown/i.test(v))
    )
  );
  const placements = Array.from(
    new Set(
      scenes
        .map((s) => String(s.composition?.subject_placement || "").trim())
        .filter((v) => v && !/not clearly specified|unknown/i.test(v))
    )
  );

  const summaryBits: string[] = [];
  if (movements.length > 0) {
    summaryBits.push(movements.join(", "));
  }
  if (framings.length > 0) {
    summaryBits.push(framings.join(", "));
  }
  if (angles.length > 0) {
    summaryBits.push(`${angles.join(", ")} angle`);
  }
  if (placements.length > 0) {
    summaryBits.push(placements[0]);
  }

  const baseCameraLine = summaryBits.length > 0 ? summaryBits.join("; ") : "";
  const formattedBase = baseCameraLine
    ? ensureSentencePunctuation(
        baseCameraLine.charAt(0).toUpperCase() + baseCameraLine.slice(1)
      )
    : "";

  const durationObs = String(realData.video_overview?.duration_observation || "").trim();
  if (formattedBase && durationObs && !isPhraseCoveredInText(durationObs, formattedBase)) {
    return `${formattedBase} ${ensureSentencePunctuation(durationObs)}`;
  }
  if (formattedBase) {
    return formattedBase;
  }
  if (durationObs) {
    return ensureSentencePunctuation(durationObs);
  }

  return "Camera framing and movement details were not separately specified in the saved visual analysis.";
}

export const VisualAnalysis: React.FC<VisualAnalysisProps> = ({
  data,
  realData,
  geminiStep1Data = null,
  groqStep2Data = null,
  step1Status = null,
  step2Status = null,
  frameRequests = [],
  frameSelectionStatus = null,
  guidedFrameMessage = null,
  guidedFrameError = null,
  isUploadingGuidedFrames = false,
  onRetryFrameSelection,
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
  samplingMetadata = null,
  videoDurationSeconds = null,
}) => {
  const [copiedSceneId, setCopiedSceneId] = useState<string | number | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);
  const [isSupportingFramesOpen, setIsSupportingFramesOpen] = useState(false);
  const [isTechnicalDetailsOpen, setIsTechnicalDetailsOpen] = useState(false);

  const normalizedStatus = String(status || "").trim().toLowerCase();
  const rawStep1Status = String(step1Status || "").trim().toLowerCase();
  const rawStep2Status = String(step2Status || "").trim().toLowerCase();
  const rawFrameSelectionStatus = String(frameSelectionStatus || "").trim().toLowerCase();

  const isCompletedStatus = normalizedStatus === "completed";
  const isFailedStatus = normalizedStatus === "failed";
  const isQueuedStatus = normalizedStatus === "queued";
  const isAwaitingFrameUpload = rawFrameSelectionStatus === "awaiting_upload";
  const isFrameSelectionFailed =
    !isUploadingGuidedFrames &&
    (Boolean(guidedFrameError) || rawFrameSelectionStatus === "failed");
  const isGroqFallbackStage =
    normalizedStatus.includes("groq") ||
    normalizedStatus.includes("fallback") ||
    normalizedStatus.includes("step2");
  const isBackendActiveStatus =
    isQueuedStatus ||
    normalizedStatus === "processing" ||
    normalizedStatus.includes("step1") ||
    normalizedStatus.includes("gemini") ||
    normalizedStatus.includes("awaiting") ||
    normalizedStatus.includes("frame") ||
    isGroqFallbackStage ||
    rawStep1Status === "processing" ||
    rawStep2Status === "processing" ||
    (isAwaitingFrameUpload && !isFrameSelectionFailed) ||
    isUploadingGuidedFrames;

  // 1. Completed + saved result MUST render immediately (never restart or show loading/stale error)
  const shouldRenderCompletedRealData = Boolean(realData) && isCompletedStatus;

  // Resolve sequential step statuses accurately for display
  const effectiveStep1Status: "pending" | "processing" | "completed" | "failed" =
    rawStep1Status === "completed" ||
    rawStep1Status === "processing" ||
    rawStep1Status === "failed" ||
    rawStep1Status === "pending"
      ? rawStep1Status
      : geminiStep1Data || shouldRenderCompletedRealData
      ? "completed"
      : isFailedStatus && !isFrameSelectionFailed
      ? "failed"
      : isBackendActiveStatus && !isQueuedStatus
      ? "processing"
      : "pending";

  const effectiveFrameSelectionStatus:
    | "pending"
    | "awaiting_upload"
    | "completed"
    | "failed" =
    isUploadingGuidedFrames
      ? "awaiting_upload"
      : guidedFrameError || rawFrameSelectionStatus === "failed"
      ? "failed"
      : rawFrameSelectionStatus === "awaiting_upload"
      ? "awaiting_upload"
      : rawFrameSelectionStatus === "completed" || shouldRenderCompletedRealData
      ? "completed"
      : rawStep2Status === "processing" || rawStep2Status === "completed"
      ? "completed"
      : "pending";

  const effectiveStep2Status: "pending" | "blocked" | "processing" | "completed" | "failed" =
    rawStep2Status === "completed" ||
    rawStep2Status === "blocked" ||
    rawStep2Status === "processing" ||
    rawStep2Status === "failed" ||
    rawStep2Status === "pending"
      ? rawStep2Status
      : effectiveStep1Status === "failed"
      ? "blocked"
      : effectiveFrameSelectionStatus === "failed"
      ? "blocked"
      : shouldRenderCompletedRealData || Boolean(groqStep2Data)
      ? "completed"
      : isFailedStatus && effectiveStep1Status === "completed" && effectiveFrameSelectionStatus === "completed"
      ? "failed"
      : effectiveStep1Status === "completed" &&
        effectiveFrameSelectionStatus === "completed" &&
        isBackendActiveStatus
      ? "processing"
      : "pending";

  const step1LabelMap: Record<typeof effectiveStep1Status, string> = {
    pending: "Waiting to start",
    processing: "Analyzing original Reel",
    completed: "Gemini outfit timeline completed",
    failed: "Gemini analysis failed",
  };

  const frameSelectionLabelMap: Record<typeof effectiveFrameSelectionStatus, string> = {
    pending: "Waiting for Gemini timeline",
    awaiting_upload: isUploadingGuidedFrames
      ? "Uploading missing representative frames"
      : "Selecting frames for detected outfit looks",
    completed: "All outfit looks covered",
    failed: "Frame selection failed",
  };

  const step2LabelMap: Record<typeof effectiveStep2Status, string> = {
    pending:
      effectiveFrameSelectionStatus === "awaiting_upload"
        ? "Waiting for missing outfit frames"
        : "Waiting for Gemini & frame coverage",
    blocked:
      effectiveFrameSelectionStatus === "failed"
        ? "Blocked until frame selection completes"
        : "Waiting because Gemini Step 1 failed",
    processing: "Groq detailed visual analysis running",
    completed: "Visual analysis completed",
    failed: "Groq analysis failed",
  };

  const hasStepMetadata =
    Boolean(step1Status) ||
    Boolean(step2Status) ||
    Boolean(frameSelectionStatus) ||
    Boolean(geminiStep1Data) ||
    Boolean(groqStep2Data) ||
    frameRequests.length > 0;

  const geminiOutfitChanges: VisualGeminiOutfitChange[] = Array.isArray(
    geminiStep1Data?.outfit_changes
  )
    ? geminiStep1Data.outfit_changes
    : [];

  const canShowGeminiStep1Result =
    !isDemoData &&
    (effectiveStep1Status === "completed" || Boolean(geminiStep1Data)) &&
    (Boolean(geminiStep1Data) || effectiveStep1Status === "completed");

  const renderTwoStepProgressCard = (compact = false) => (
    <div
      className={cn(
        "rounded-xl border border-card-border bg-card shadow-card text-left",
        compact ? "p-4 space-y-3" : "p-5 space-y-3.5"
      )}
    >
      <div className="flex items-center justify-between gap-2 border-b border-card-border/60 pb-2.5">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-primary/15 text-primary border border-primary/25">
            <Layers className="h-3.5 w-3.5" />
          </span>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-text-primary">
              Sequential Visual Analysis Pipeline
            </h4>
            <p className="text-[11px] text-text-muted">
              Original video outfit timeline → Timeline-guided frame coverage → Groq look enrichment
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
        {/* Step 1 — Gemini Original Video Analysis */}
        <div
          className={cn(
            "rounded-lg border p-3.5 space-y-1.5 transition-colors",
            effectiveStep1Status === "completed"
              ? "bg-success/5 border-success/30"
              : effectiveStep1Status === "failed"
              ? "bg-error/5 border-error/30"
              : effectiveStep1Status === "processing"
              ? "bg-primary/5 border-primary/35"
              : "bg-background-elevated/60 border-card-border"
          )}
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-bold text-text-primary">
              Step 1 — Gemini Original Reel
            </span>
            {effectiveStep1Status === "completed" ? (
              <span className="inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-mono font-semibold bg-success/15 text-success border border-success/25 shrink-0">
                <Check className="h-3 w-3" />
                Completed
              </span>
            ) : effectiveStep1Status === "processing" ? (
              <span className="inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-mono font-semibold bg-primary/15 text-primary border border-primary/30 shrink-0">
                <Loader2 className="h-3 w-3 animate-spin" />
                Processing
              </span>
            ) : effectiveStep1Status === "failed" ? (
              <span className="inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-mono font-semibold bg-error/15 text-error border border-error/30 shrink-0">
                <AlertTriangle className="h-3 w-3" />
                Failed
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-mono font-semibold bg-background-elevated text-text-muted border border-card-border shrink-0">
                <Clock className="h-3 w-3" />
                Pending
              </span>
            )}
          </div>
          <p
            className={cn(
              "text-xs font-medium",
              effectiveStep1Status === "completed"
                ? "text-success"
                : effectiveStep1Status === "failed"
                ? "text-error"
                : effectiveStep1Status === "processing"
                ? "text-primary"
                : "text-text-secondary"
            )}
          >
            {step1LabelMap[effectiveStep1Status]}
          </p>
        </div>

        {/* Step 2 — Timeline-Guided Frame Selection */}
        <div
          className={cn(
            "rounded-lg border p-3.5 space-y-1.5 transition-colors",
            effectiveFrameSelectionStatus === "completed"
              ? "bg-success/5 border-success/30"
              : effectiveFrameSelectionStatus === "failed"
              ? "bg-error/5 border-error/30"
              : effectiveFrameSelectionStatus === "awaiting_upload"
              ? "bg-primary/5 border-primary/35"
              : "bg-background-elevated/60 border-card-border"
          )}
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-bold text-text-primary">
              Step 2 — Guided Frame Coverage
            </span>
            {effectiveFrameSelectionStatus === "completed" ? (
              <span className="inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-mono font-semibold bg-success/15 text-success border border-success/25 shrink-0">
                <Check className="h-3 w-3" />
                Covered
              </span>
            ) : effectiveFrameSelectionStatus === "awaiting_upload" ? (
              <span className="inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-mono font-semibold bg-primary/15 text-primary border border-primary/30 shrink-0">
                <Loader2 className="h-3 w-3 animate-spin" />
                Uploading
              </span>
            ) : effectiveFrameSelectionStatus === "failed" ? (
              <span className="inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-mono font-semibold bg-error/15 text-error border border-error/30 shrink-0">
                <AlertTriangle className="h-3 w-3" />
                Failed
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-mono font-semibold bg-background-elevated text-text-muted border border-card-border shrink-0">
                <Clock className="h-3 w-3" />
                Pending
              </span>
            )}
          </div>
          <p
            className={cn(
              "text-xs font-medium",
              effectiveFrameSelectionStatus === "completed"
                ? "text-success"
                : effectiveFrameSelectionStatus === "failed"
                ? "text-error"
                : effectiveFrameSelectionStatus === "awaiting_upload"
                ? "text-primary"
                : "text-text-secondary"
            )}
          >
            {frameSelectionLabelMap[effectiveFrameSelectionStatus]}
            {effectiveFrameSelectionStatus === "awaiting_upload" && frameRequests.length > 0
              ? ` (${frameRequests.length} ${frameRequests.length === 1 ? "frame" : "frames"})`
              : ""}
          </p>
        </div>

        {/* Step 3 — Groq Detailed Visual Analysis */}
        <div
          className={cn(
            "rounded-lg border p-3.5 space-y-1.5 transition-colors",
            effectiveStep2Status === "completed"
              ? "bg-success/5 border-success/30"
              : effectiveStep2Status === "failed"
              ? "bg-error/5 border-error/30"
              : effectiveStep2Status === "blocked"
              ? "bg-warning/5 border-warning/30"
              : effectiveStep2Status === "processing"
              ? "bg-primary/5 border-primary/35"
              : "bg-background-elevated/60 border-card-border"
          )}
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-bold text-text-primary">
              Step 3 — Groq Look Analysis
            </span>
            {effectiveStep2Status === "completed" ? (
              <span className="inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-mono font-semibold bg-success/15 text-success border border-success/25 shrink-0">
                <Check className="h-3 w-3" />
                Completed
              </span>
            ) : effectiveStep2Status === "processing" ? (
              <span className="inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-mono font-semibold bg-primary/15 text-primary border border-primary/30 shrink-0">
                <Loader2 className="h-3 w-3 animate-spin" />
                Processing
              </span>
            ) : effectiveStep2Status === "failed" ? (
              <span className="inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-mono font-semibold bg-error/15 text-error border border-error/30 shrink-0">
                <AlertTriangle className="h-3 w-3" />
                Failed
              </span>
            ) : effectiveStep2Status === "blocked" ? (
              <span className="inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-mono font-semibold bg-warning/15 text-warning border border-warning/30 shrink-0">
                <ShieldAlert className="h-3 w-3" />
                Blocked
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-mono font-semibold bg-background-elevated text-text-muted border border-card-border shrink-0">
                <Clock className="h-3 w-3" />
                Pending
              </span>
            )}
          </div>
          <p
            className={cn(
              "text-xs font-medium",
              effectiveStep2Status === "completed"
                ? "text-success"
                : effectiveStep2Status === "failed"
                ? "text-error"
                : effectiveStep2Status === "blocked"
                ? "text-warning"
                : effectiveStep2Status === "processing"
                ? "text-primary"
                : "text-text-secondary"
            )}
          >
            {step2LabelMap[effectiveStep2Status]}
          </p>
        </div>
      </div>
    </div>
  );

  const renderGeminiOutfitTimelineCard = () => {
    if (!canShowGeminiStep1Result) return null;

    return (
      <div className="rounded-xl border border-card-border bg-card p-5 space-y-4 shadow-card text-left">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-card-border/60 pb-3">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-lg bg-primary/15 text-primary border border-primary/25">
              <Sparkles className="h-4 w-4" />
            </span>
            <div>
              <h3 className="text-sm font-bold text-text-primary">
                Gemini Step 1 — Outfit Change Timeline ({geminiOutfitChanges.length}{" "}
                {geminiOutfitChanges.length === 1 ? "Look" : "Looks"})
              </h3>
              <p className="text-[11px] text-text-muted">
                Extracted directly from your uploaded original Reel
              </p>
            </div>
          </div>

          <span className="inline-flex items-center gap-1 rounded bg-success/15 px-2.5 py-0.5 text-[10px] font-mono font-semibold text-success border border-success/25 w-fit">
            <Check className="h-3 w-3" />
            Outfit timeline ready
          </span>
        </div>

        {(typeof geminiStep1Data?.summary === "string" && geminiStep1Data.summary.trim().length > 0) ||
        (typeof geminiStep1Data?.video_overview?.summary === "string" &&
          geminiStep1Data.video_overview.summary.trim().length > 0) ? (
          <div className="rounded-lg bg-background-elevated/70 p-3.5 border border-card-border text-xs text-text-secondary leading-relaxed">
            {geminiStep1Data?.summary || geminiStep1Data?.video_overview?.summary}
          </div>
        ) : null}

        {geminiOutfitChanges.length > 0 ? (
          <div className="space-y-3">
            {geminiOutfitChanges.map((item, idx) => {
              const lookNum = item.look_number ?? item.outfit_number ?? idx + 1;
              const startSec = parseFlexibleSeconds(
                item.start_time ??
                  item.start_time_seconds ??
                  item.estimated_start_time_seconds ??
                  item.estimated_start_seconds ??
                  item.start_timestamp
              );
              const endSec = parseFlexibleSeconds(
                item.end_time ??
                  item.end_time_seconds ??
                  item.estimated_end_time_seconds ??
                  item.estimated_end_seconds ??
                  item.end_timestamp
              );
              const rangeLabel =
                startSec !== null && endSec !== null
                  ? formatPreciseTimeRange(startSec, endSec)
                  : startSec !== null
                  ? formatSecondsToPreciseTimestamp(startSec)
                  : item.start_time || item.end_time || item.start_timestamp || item.end_timestamp
                  ? `${item.start_time ?? item.start_timestamp ?? "?"}–${
                      item.end_time ?? item.end_timestamp ?? "?"
                    }`
                  : null;

              const description = formatOutfitDetailValue(
                item.description ?? item.outfit_description
              );
              const visibleEvidence = formatOutfitDetailValue(
                item.visible_evidence ?? item.evidence_notes ?? item.notes
              );
              const cameraFraming = formatOutfitDetailValue(item.camera_framing);
              const backgroundDetail = formatOutfitDetailValue(item.background);
              const clothing = formatOutfitDetailValue(item.clothing);
              const footwear = formatOutfitDetailValue(item.footwear);
              const accessories = formatOutfitDetailValue(item.accessories);
              const hairstyle = formatOutfitDetailValue(item.hairstyle);
              const transitionConfidence =
                item.transition_confidence !== undefined && item.transition_confidence !== null
                  ? String(item.transition_confidence).trim()
                  : null;
              const itemWarnings = Array.isArray(item.warnings)
                ? item.warnings.filter((w) => typeof w === "string" && w.trim().length > 0)
                : [];

              return (
                <div
                  key={`gemini-look-${lookNum}-${idx}`}
                  className="rounded-xl border border-card-border bg-background-elevated/40 p-4 space-y-3 hover:border-primary/40 transition-colors"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-card-border/60 pb-2.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-primary/20 text-primary border border-primary/30">
                        Look {lookNum}
                      </span>
                      {rangeLabel &&
                        (startSec !== null ? (
                          <button
                            type="button"
                            onClick={() => onSeek(startSec)}
                            className="inline-flex items-center gap-1.5 rounded bg-primary/10 hover:bg-primary/20 text-primary border border-primary/25 px-2.5 py-0.5 font-mono text-xs font-semibold transition-colors cursor-pointer"
                            title="Seek video to detected look start"
                          >
                            <Play className="h-3 w-3 fill-current" />
                            <span>{rangeLabel}</span>
                          </button>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded bg-background-elevated text-text-secondary border border-card-border px-2.5 py-0.5 font-mono text-xs font-semibold">
                            {rangeLabel}
                          </span>
                        ))}
                    </div>

                    {transitionConfidence && (
                      <span className="rounded bg-card px-2 py-0.5 text-[10px] font-mono text-text-muted border border-card-border">
                        Confidence: {transitionConfidence}
                      </span>
                    )}
                  </div>

                  {description && (
                    <p className="text-xs leading-relaxed text-text-primary font-medium">
                      {description}
                    </p>
                  )}

                  {(clothing ||
                    footwear ||
                    accessories ||
                    hairstyle ||
                    cameraFraming ||
                    backgroundDetail ||
                    visibleEvidence) && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 text-[11px]">
                      {clothing && (
                        <div className="rounded-lg bg-card/80 p-2.5 border border-card-border/80 space-y-1">
                          <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider block">
                            Clothing
                          </span>
                          <p className="text-text-secondary leading-relaxed">{clothing}</p>
                        </div>
                      )}
                      {footwear && (
                        <div className="rounded-lg bg-card/80 p-2.5 border border-card-border/80 space-y-1">
                          <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider block">
                            Footwear
                          </span>
                          <p className="text-text-secondary leading-relaxed">{footwear}</p>
                        </div>
                      )}
                      {accessories && (
                        <div className="rounded-lg bg-card/80 p-2.5 border border-card-border/80 space-y-1">
                          <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider block">
                            Accessories
                          </span>
                          <p className="text-text-secondary leading-relaxed">{accessories}</p>
                        </div>
                      )}
                      {hairstyle && (
                        <div className="rounded-lg bg-card/80 p-2.5 border border-card-border/80 space-y-1">
                          <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider block">
                            Hairstyle
                          </span>
                          <p className="text-text-secondary leading-relaxed">{hairstyle}</p>
                        </div>
                      )}
                      {cameraFraming && (
                        <div className="rounded-lg bg-card/80 p-2.5 border border-card-border/80 space-y-1">
                          <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider block">
                            Camera Framing
                          </span>
                          <p className="text-text-secondary leading-relaxed">{cameraFraming}</p>
                        </div>
                      )}
                      {backgroundDetail && (
                        <div className="rounded-lg bg-card/80 p-2.5 border border-card-border/80 space-y-1">
                          <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider block">
                            Background
                          </span>
                          <p className="text-text-secondary leading-relaxed">{backgroundDetail}</p>
                        </div>
                      )}
                      {visibleEvidence && (
                        <div className="rounded-lg bg-card/80 p-2.5 border border-card-border/80 space-y-1 sm:col-span-2 lg:col-span-3">
                          <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider block">
                            Visible Evidence
                          </span>
                          <p className="text-text-secondary leading-relaxed">{visibleEvidence}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {itemWarnings.length > 0 && (
                    <div className="rounded-lg bg-warning/10 border border-warning/25 px-3 py-2 text-[11px] text-warning space-y-0.5">
                      {itemWarnings.map((warn, wIdx) => (
                        <p key={wIdx}>Note: {warn}</p>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-xs text-text-muted italic">
            No outfit changes were recorded in Gemini original video analysis.
          </p>
        )}
      </div>
    );
  };

  // 2. Active manual start/retry, timeline-guided frame upload, or active backend sequential job
  const showActiveProgress =
    !shouldRenderCompletedRealData &&
    !isFrameSelectionFailed &&
    ((isProcessing && Boolean(progressStepMessage)) ||
      isUploadingGuidedFrames ||
      (isAwaitingFrameUpload && !isFailedStatus) ||
      (isBackendActiveStatus &&
        !isFailedStatus &&
        rawStep1Status !== "failed" &&
        rawStep2Status !== "failed"));

  if (showActiveProgress) {
    const progressLower = (guidedFrameMessage || progressStepMessage || "").toLowerCase();
    const activeStageIndex = guidedFrameMessage || isAwaitingFrameUpload || isUploadingGuidedFrames
      ? progressLower.includes("groq")
        ? 4
        : progressLower.includes("covered")
        ? 4
        : progressLower.includes("upload")
        ? 3
        : 2
      : progressStepMessage
      ? progressLower.includes("queue")
        ? 1
        : 0
      : effectiveStep1Status === "completed" && effectiveStep2Status === "processing"
      ? 4
      : isQueuedStatus
      ? 1
      : 1;

    const pipelineStages = [
      "Sample initial frames",
      "Gemini outfit timeline",
      "Selecting look frames",
      "Uploading missing frames",
      "Groq look analysis",
    ];

    const activeHeading =
      guidedFrameMessage ||
      progressStepMessage ||
      (effectiveFrameSelectionStatus === "awaiting_upload"
        ? "Selecting frames for detected outfit looks..."
        : effectiveStep1Status === "completed" && effectiveStep2Status === "processing"
        ? "Groq detailed visual analysis running..."
        : effectiveStep1Status === "processing"
        ? "Step 1: Analyzing original Reel with Gemini..."
        : isGroqFallbackStage
        ? "Groq detailed visual analysis running..."
        : isQueuedStatus
        ? "Queued for visual analysis..."
        : "Processing visual analysis...");

    const activeDescription =
      progressStepMessage
        ? "Running adaptive representative frame sampling across your uploaded Reel before queueing sequential analysis."
        : effectiveFrameSelectionStatus === "awaiting_upload" || isUploadingGuidedFrames
        ? "Gemini outfit timeline completed. Extracting and uploading requested frames directly from your original Reel so every detected look has clear visual evidence."
        : effectiveStep1Status === "completed" && effectiveFrameSelectionStatus === "completed"
        ? "All outfit looks covered. Groq detailed visual analysis is enriching your Gemini-detected looks below."
        : isQueuedStatus
        ? "Your Reel visual analysis job is queued in the background. Monitoring Gemini Step 1, frame coverage, and Groq status..."
        : "Observing original Reel outfits, scenes, camera framing, visible subjects, and visual composition.";

    const activeFooterLabel =
      progressStepMessage
        ? "Analyzing video progressively in browser"
        : isUploadingGuidedFrames || effectiveFrameSelectionStatus === "awaiting_upload"
        ? "Timeline-guided frame coverage in progress"
        : effectiveStep1Status === "completed" && effectiveStep2Status === "processing"
        ? "Groq analysis running • Checking status every 5 seconds"
        : effectiveStep1Status === "processing"
        ? "Gemini Step 1 running • Checking status every 5 seconds"
        : isQueuedStatus
        ? "Queued • Checking status every 5 seconds"
        : "Processing • Checking status every 5 seconds";

    return (
      <div className="space-y-5">
        <div className="rounded-2xl border border-primary/30 bg-card p-6 sm:p-8 shadow-card text-center space-y-5">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 text-primary mx-auto">
            <Loader2 className="h-7 w-7 animate-spin" />
          </div>
          <div className="max-w-lg mx-auto space-y-2">
            <h3 className="text-lg font-bold text-text-primary">
              {activeHeading}
            </h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              {activeDescription}
            </p>
            <div className="pt-1 text-[11px] font-mono text-text-muted flex items-center justify-center gap-2">
              <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              <span>{activeFooterLabel}</span>
            </div>

            {/* 5-Stage Sequential Progress */}
            <div className="pt-2 flex flex-wrap items-center justify-center gap-1.5">
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

            {frameRequests.length > 0 && (
              <div className="pt-3 mt-2 border-t border-card-border/60 space-y-2 text-left">
                <p className="text-[11px] font-semibold text-text-secondary text-center">
                  Requested Timeline-Guided Look Frames ({frameRequests.length})
                </p>
                <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
                  {frameRequests.map((req, idx) => (
                    <div
                      key={`${req.look_number}-${req.timestamp_seconds}-${idx}`}
                      className="rounded-lg bg-background-elevated/80 border border-card-border px-3 py-2 text-[11px] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1"
                    >
                      <div className="flex items-center gap-2 font-mono">
                        <span className="rounded bg-primary/15 text-primary border border-primary/25 px-1.5 py-0.5 text-[10px] font-bold">
                          Look {req.look_number}
                        </span>
                        <span className="text-text-primary font-semibold">
                          {formatSecondsToPreciseTimestamp(req.timestamp_seconds)}
                        </span>
                        <span className="text-text-muted text-[10px]">
                          ({formatPreciseTimeRange(req.start_time_seconds, req.end_time_seconds)})
                        </span>
                      </div>
                      {req.reason && (
                        <span className="text-[10px] text-text-muted line-clamp-1">
                          {req.reason}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!progressStepMessage && submittedFrames.length > 0 && (
              <div className="pt-3 mt-2 border-t border-card-border/60 space-y-2">
                <p className="text-[11px] font-semibold text-text-secondary">
                  {submittedFrames.length} representative{" "}
                  {submittedFrames.length === 1 ? "frame" : "frames"} uploaded & submitted
                </p>
                {samplingMetadata && (
                  <div className="flex flex-wrap items-center justify-center gap-1.5 text-[10px] font-mono text-text-muted">
                    {samplingMetadata.actualDurationSeconds !== null && (
                      <span className="rounded bg-background-elevated px-2 py-0.5 border border-card-border">
                        Duration: {samplingMetadata.actualDurationSeconds.toFixed(2)}s
                      </span>
                    )}
                    {samplingMetadata.firstTimestampSeconds !== null && (
                      <span className="rounded bg-background-elevated px-2 py-0.5 border border-card-border">
                        First: {samplingMetadata.firstTimestampSeconds.toFixed(2)}s
                      </span>
                    )}
                    {samplingMetadata.lastTimestampSeconds !== null && (
                      <span className="rounded bg-background-elevated px-2 py-0.5 border border-card-border">
                        Last: {samplingMetadata.lastTimestampSeconds.toFixed(2)}s
                      </span>
                    )}
                    {samplingMetadata.openingFrameCovered !== null && (
                      <span
                        className={cn(
                          "rounded px-2 py-0.5 border",
                          samplingMetadata.openingFrameCovered
                            ? "bg-success/10 text-success border-success/25"
                            : "bg-warning/10 text-warning border-warning/25"
                        )}
                      >
                        Start: {samplingMetadata.openingFrameCovered ? "Covered" : "Missed"}
                      </span>
                    )}
                    {samplingMetadata.endFrameCovered !== null && (
                      <span
                        className={cn(
                          "rounded px-2 py-0.5 border",
                          samplingMetadata.endFrameCovered
                            ? "bg-success/10 text-success border-success/25"
                            : "bg-warning/10 text-warning border-warning/25"
                        )}
                      >
                        End: {samplingMetadata.endFrameCovered ? "Covered" : "Failed"}
                      </span>
                    )}
                    <span
                      className={cn(
                        "rounded px-2 py-0.5 border",
                        samplingMetadata.samplingLimitReached
                          ? "bg-warning/10 text-warning border-warning/25"
                          : "bg-background-elevated border-card-border"
                      )}
                    >
                      30-Frame Limit: {samplingMetadata.samplingLimitReached ? "Reached" : "Within limit"}
                    </span>
                  </div>
                )}
                {samplingMetadata?.endpointWarning && (
                  <p className="text-[11px] text-warning bg-warning/10 border border-warning/25 rounded-md px-3 py-1.5 text-left">
                    {samplingMetadata.endpointWarning}
                  </p>
                )}
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

        {/* Sequential Pipeline Progress Display */}
        {renderTwoStepProgressCard(true)}

        {/* Immediately show Gemini Step 1 outfit timeline once completed, even while guided frames upload or Groq runs */}
        {renderGeminiOutfitTimelineCard()}
      </div>
    );
  }

  // 3. Failed State with Stage-Aware Retry Action (preserves Step 1 & frame requests on failure)
  const isGuidedSelectionFailure =
    effectiveStep1Status === "completed" && isFrameSelectionFailed;
  const isStep2OnlyFailure =
    effectiveStep1Status === "completed" &&
    !isGuidedSelectionFailure &&
    effectiveStep2Status === "failed";

  if (
    !shouldRenderCompletedRealData &&
    (isGuidedSelectionFailure ||
      isFailedStatus ||
      effectiveStep1Status === "failed" ||
      effectiveStep2Status === "failed" ||
      (!realData && Boolean(errorMessage)))
  ) {
    const retryHandler = isGuidedSelectionFailure
      ? onRetryFrameSelection || onRetry
      : onRetry;

    return (
      <div className="space-y-5">
        {renderTwoStepProgressCard(true)}

        <div className="rounded-2xl border border-error/30 bg-card p-6 sm:p-8 shadow-card space-y-4">
          <div className="flex items-start gap-3.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-error/15 text-error shrink-0 border border-error/25">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div className="space-y-1 flex-1">
              <h3 className="text-base font-bold text-text-primary">
                {isGuidedSelectionFailure
                  ? "Timeline-Guided Frame Selection Failed"
                  : isStep2OnlyFailure
                  ? "Step 3 (Groq Look Analysis) Failed"
                  : "Visual Analysis Failed"}
              </h3>
              <p className="text-xs text-error leading-relaxed">
                {isGuidedSelectionFailure
                  ? guidedFrameError ||
                    errorMessage ||
                    "Failed to extract or upload the requested representative frames from the original Reel."
                  : errorMessage ||
                    (isStep2OnlyFailure
                      ? "Groq detailed frame analysis encountered an error. Gemini's Step 1 outfit timeline is preserved below."
                      : "The backend encountered an error while processing visuals from your Reel.")}
              </p>
              <p className="text-[11px] text-text-muted mt-1">
                {isGuidedSelectionFailure
                  ? "Gemini Step 1's outfit timeline and pending frame requests are preserved. Retry frame selection to upload the missing look frames without rerunning Gemini."
                  : isStep2OnlyFailure
                  ? "Your saved Step 1 outfit timeline remains intact. Retry Step 2 to resume frame analysis without losing Gemini's results."
                  : "Your uploaded Reel is securely saved in storage. You do not need to re-upload your video to retry analysis."}
              </p>

              {isGuidedSelectionFailure && frameRequests.length > 0 && (
                <div className="pt-2 space-y-1.5">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-text-muted block">
                    Preserved Frame Requests ({frameRequests.length}):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {frameRequests.map((req, idx) => (
                      <button
                        key={`failed-req-${req.look_number}-${req.timestamp_seconds}-${idx}`}
                        type="button"
                        onClick={() => onSeek(req.timestamp_seconds)}
                        className="inline-flex items-center gap-1 rounded bg-background-elevated px-2 py-0.5 font-mono text-[10px] text-text-secondary border border-card-border hover:border-primary/40 cursor-pointer"
                      >
                        <Play className="h-2.5 w-2.5 text-primary fill-current" />
                        <span>
                          Look {req.look_number} ·{" "}
                          {formatSecondsToPreciseTimestamp(req.timestamp_seconds)}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {retryHandler && (
            <div className="flex justify-end pt-2 border-t border-card-border/80">
              <Button
                variant="primary"
                size="sm"
                onClick={retryHandler}
                leftIcon={<RotateCcw className="h-4 w-4" />}
              >
                {isGuidedSelectionFailure
                  ? "Retry Frame Selection"
                  : isStep2OnlyFailure
                  ? "Retry Step 2"
                  : "Retry"}
              </Button>
            </div>
          )}
        </div>

        {/* Preserve and continue displaying Gemini Step 1 result if frame selection or Step 2 failed */}
        {renderGeminiOutfitTimelineCard()}
      </div>
    );
  }

  // 4. Pending / Not Analyzed State (manual start only — never auto-starts on reopen)
  if (!realData && !data && (normalizedStatus === "pending" || !normalizedStatus)) {
    return (
      <div className="space-y-5">
        <div className="rounded-2xl border border-card-border bg-card p-8 sm:p-10 shadow-card text-center space-y-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 text-primary mx-auto">
            <Sparkles className="h-8 w-8" />
          </div>
          <div className="max-w-md mx-auto space-y-2">
            <h3 className="text-lg font-bold text-text-primary">
              Ready for Visual Intelligence
            </h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              Your Reel is stored in private Supabase Storage. Run the two-step Visual Analysis pipeline
              (Step 1 Gemini original video outfit analysis, followed by Step 2 Groq adaptive frame analysis)
              to observe outfits, scenes, camera framing, visible subjects, and visual composition.
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

        {renderTwoStepProgressCard(true)}
      </div>
    );
  }

  // 5. Edge case: status is completed in DB but visual_analysis payload is empty
  if (isCompletedStatus && !realData && !data) {
    return (
      <div className="space-y-5">
        {hasStepMetadata && renderTwoStepProgressCard(true)}
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
        {renderGeminiOutfitTimelineCard()}
      </div>
    );
  }

  // =========================================================================
  // 6. REAL BACKEND DATA RENDERING (Concise Subject + Shots + Camera & Framing)
  // =========================================================================
  if (realData) {
    const overview = realData.video_overview;
    const groqFallbackScenes: VisualBackendScene[] =
      groqStep2Data &&
      typeof groqStep2Data === "object" &&
      Array.isArray((groqStep2Data as VisualBackendResult).scenes)
        ? (groqStep2Data as VisualBackendResult).scenes
        : [];
    const scenes = [...(realData.scenes?.length ? realData.scenes : groqFallbackScenes)].sort(
      (a, b) => (a.start_time_seconds ?? 0) - (b.start_time_seconds ?? 0)
    );
    const metadata = realData.analysis_metadata || { warnings: [] };

    // Dominant colors aggregated across scenes (kept in collapsed Technical Details)
    const allColours = Array.from(
      new Set(
        scenes.flatMap((s) => s.composition?.dominant_colours || []).filter(Boolean)
      )
    );

    const providerIdentityText = [metadata.provider, metadata.source, metadata.model]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    const isGroqFallbackResult =
      Boolean(metadata.fallback_used) ||
      providerIdentityText.includes("groq") ||
      providerIdentityText.includes("qwen") ||
      providerIdentityText.includes("fallback");

    const hasGeminiTimeline =
      effectiveStep1Status === "completed" || geminiOutfitChanges.length > 0;

    // Synthesize chronological shot cards from Gemini outfit timeline + matched Groq frame observations
    const synthesizedShots = buildSynthesizedShots(geminiOutfitChanges, scenes);
    const subjectText = buildSubjectSummaryText(
      geminiStep1Data,
      groqStep2Data,
      { ...realData, scenes },
      synthesizedShots
    );
    const cameraFramingText = buildCameraFramingSummaryText(
      geminiStep1Data,
      groqStep2Data,
      { ...realData, scenes }
    );

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

    const resolvedActualDuration =
      typeof metadata.actual_video_duration_seconds === "number" &&
      metadata.actual_video_duration_seconds > 0
        ? metadata.actual_video_duration_seconds
        : typeof samplingMetadata?.actualDurationSeconds === "number" &&
          samplingMetadata.actualDurationSeconds > 0
        ? samplingMetadata.actualDurationSeconds
        : typeof videoDurationSeconds === "number" && videoDurationSeconds > 0
        ? videoDurationSeconds
        : null;

    const resolvedFirstTimestamp =
      resolvedSubmittedFrames.length > 0
        ? resolvedSubmittedFrames[0].timestamp_seconds
        : typeof metadata.first_selected_timestamp_seconds === "number"
        ? metadata.first_selected_timestamp_seconds
        : samplingMetadata?.firstTimestampSeconds ?? null;

    const resolvedLastTimestamp =
      resolvedSubmittedFrames.length > 0
        ? resolvedSubmittedFrames[resolvedSubmittedFrames.length - 1].timestamp_seconds
        : typeof metadata.last_selected_timestamp_seconds === "number"
        ? metadata.last_selected_timestamp_seconds
        : samplingMetadata?.lastTimestampSeconds ?? null;

    const resolvedOpeningCovered =
      typeof metadata.opening_frame_covered === "boolean"
        ? metadata.opening_frame_covered
        : samplingMetadata?.openingFrameCovered ?? null;

    const resolvedEndCovered =
      typeof metadata.end_frame_covered === "boolean"
        ? metadata.end_frame_covered
        : samplingMetadata?.endFrameCovered ?? null;

    const resolvedLimitReached = Boolean(
      metadata.sampling_limit_reached ??
        samplingMetadata?.samplingLimitReached ??
        resolvedFrameCount >= 30
    );

    const resolvedEndpointWarning =
      metadata.endpoint_warning ||
      samplingMetadata?.endpointWarning ||
      (resolvedEndCovered === false
        ? "Final endpoint frame could not be extracted due to video seeking or encoding failure. The closing portion of this Reel may not be covered."
        : resolvedOpeningCovered === false
        ? "Opening endpoint frame near 0.00s could not be extracted due to video seeking or encoding failure."
        : null);

    const resolvedSamplingWarning = resolvedLimitReached
      ? metadata.sampling_warning ||
        samplingMetadata?.samplingWarning ||
        samplingWarning ||
        "Reached the 30-frame safety ceiling; reserved opening and final endpoint frames, then prioritized the strongest detected visual changes and remaining temporal coverage."
      : null;

    const showCoverageTelemetry =
      resolvedActualDuration !== null ||
      resolvedFirstTimestamp !== null ||
      resolvedLastTimestamp !== null ||
      resolvedOpeningCovered !== null ||
      resolvedEndCovered !== null ||
      resolvedFrameCount > 0;

    const isSourceVerified =
      hasGeminiTimeline &&
      (effectiveStep1Status === "completed" || !isGroqFallbackResult);

    const handleCopyAllBreakdownSummary = () => {
      const lines: string[] = [
        `Subject: ${subjectText}`,
        "",
        `Outfit Changes (${synthesizedShots.length} ${
          synthesizedShots.length === 1 ? "Shot" : "Shots"
        }):`,
        ...synthesizedShots.map(
          (shot) => `Shot ${shot.shotNumber} — ${shot.timestampLabel}\n${shot.description}`
        ),
        "",
        `Camera & Framing: ${cameraFramingText}`,
      ];
      navigator.clipboard.writeText(lines.join("\n"));
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 2000);
    };

    const handleCopyRow = (id: string | number, text: string) => {
      navigator.clipboard.writeText(text);
      setCopiedSceneId(id);
      setTimeout(() => setCopiedSceneId(null), 1800);
    };

    return (
      <div className="space-y-5">
        {/* Concise Status & Action Header (No noisy frame indexes or batch counts) */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 rounded-xl bg-primary/10 border border-primary/25 px-4 py-3 text-xs shadow-sm">
          <div className="flex items-center gap-2.5 text-text-secondary">
            <span
              className={cn(
                "inline-block h-2.5 w-2.5 rounded-full shrink-0",
                hasGeminiTimeline ? "bg-success" : "bg-warning"
              )}
            />
            <div>
              <span className="font-semibold text-text-primary">
                {hasGeminiTimeline
                  ? "Visual analysis completed."
                  : "Sampled-frame visual analysis completed."}
              </span>
              <span className="hidden sm:inline text-text-muted ml-1.5">
                {hasGeminiTimeline
                  ? "— Gemini original-video outfit timeline with Groq sampled-frame enrichment"
                  : "— Groq analyzed sampled representative frames only (not the complete video)"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {synthesizedShots.length > 0 && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-background-elevated text-text-secondary border border-card-border font-semibold">
                {synthesizedShots.length} {synthesizedShots.length === 1 ? "Shot" : "Shots"}
              </span>
            )}
            <Button
              variant="secondary"
              size="sm"
              onClick={handleCopyAllBreakdownSummary}
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
        {/* 1. SUBJECT (Single concise section, preserves source verified status) */}
        {/* =================================================================== */}
        <div className="rounded-xl border border-card-border bg-card p-5 space-y-3 shadow-card">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-card-border/60 pb-3">
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-lg bg-primary/15 text-primary border border-primary/25">
                <User className="h-4 w-4" />
              </span>
              <div>
                <h3 className="text-sm font-bold text-text-primary">1. Subject</h3>
                <p className="text-[11px] text-text-muted">
                  Consistent subject appearance and hairstyle progression across the Reel
                </p>
              </div>
            </div>

            {isSourceVerified ? (
              <span className="inline-flex items-center gap-1 rounded bg-success/15 px-2.5 py-0.5 text-[10px] font-mono font-semibold text-success border border-success/25">
                <Check className="h-3 w-3" />
                Verified • Original Reel
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded bg-warning/15 px-2.5 py-0.5 text-[10px] font-mono font-semibold text-warning border border-warning/25">
                <Info className="h-3 w-3" />
                Sampled Frames Only
              </span>
            )}
          </div>

          <p className="text-xs sm:text-[13px] leading-relaxed text-text-primary">
            {subjectText}
          </p>
        </div>

        {/* =================================================================== */}
        {/* 2. OUTFIT CHANGES — N SHOTS                                         */}
        {/* =================================================================== */}
        <div className="rounded-xl border border-card-border bg-card p-5 space-y-4 shadow-card">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-card-border/70 pb-3">
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-lg bg-primary/15 text-primary border border-primary/25">
                <Layers className="h-4 w-4" />
              </span>
              <div>
                <h3 className="text-sm font-bold text-text-primary">
                  2. Outfit Changes — {synthesizedShots.length}{" "}
                  {synthesizedShots.length === 1 ? "Shot" : "Shots"}
                </h3>
                <p className="text-[11px] text-text-muted">
                  {hasGeminiTimeline
                    ? "Chronological shots from Gemini's original-video outfit timeline, enriched with Groq sampled-frame actions"
                    : "Chronological outfit segments grouped from Groq sampled-frame observations"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 flex-wrap text-[10px] font-mono">
              {hasGeminiTimeline && (
                <span className="rounded bg-primary/10 text-primary border border-primary/25 px-2 py-0.5 font-semibold">
                  Gemini Timeline
                </span>
              )}
              {scenes.length > 0 && (
                <span className="rounded bg-background-elevated text-text-secondary border border-card-border px-2 py-0.5">
                  Groq Frame Enrichment
                </span>
              )}
            </div>
          </div>

          {synthesizedShots.length > 0 ? (
            <div className="space-y-3">
              {synthesizedShots.map((shot) => (
                <div
                  key={`shot-${shot.shotNumber}-${shot.timestampLabel}`}
                  className="rounded-xl border border-card-border bg-background-elevated/45 p-4 space-y-2.5 hover:border-primary/40 transition-colors"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded text-[11px] font-mono font-bold bg-primary/20 text-primary border border-primary/30">
                        Shot {shot.shotNumber}
                      </span>
                      <button
                        type="button"
                        onClick={() => onSeek(shot.startSec)}
                        className="inline-flex items-center gap-1.5 rounded bg-primary/10 hover:bg-primary/20 text-primary border border-primary/25 px-2.5 py-0.5 font-mono text-xs font-semibold transition-colors cursor-pointer"
                        title="Seek video to shot timestamp"
                      >
                        <Play className="h-3 w-3 fill-current" />
                        <span>{shot.timestampLabel}</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-text-muted">
                        {shot.sourceKind === "gemini_plus_groq"
                          ? "Gemini timeline + Groq frames"
                          : shot.sourceKind === "gemini_only"
                          ? "Gemini timeline"
                          : "Groq sampled frames"}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          handleCopyRow(
                            `shot-${shot.shotNumber}`,
                            `Shot ${shot.shotNumber} — ${shot.timestampLabel}\n${shot.description}`
                          )
                        }
                        className="p-1 rounded text-text-muted hover:text-text-primary hover:bg-background-elevated transition-colors"
                        title="Copy shot description"
                      >
                        {copiedSceneId === `shot-${shot.shotNumber}` ? (
                          <Check className="h-3.5 w-3.5 text-success" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <p className="text-xs sm:text-[13px] leading-relaxed text-text-primary">
                    {shot.description}
                  </p>

                  {shot.groqEnrichment &&
                    !isPhraseCoveredInText(shot.groqEnrichment, shot.description) && (
                      <div className="rounded-lg bg-card/75 border border-card-border/80 px-3 py-2 text-[11px] text-text-secondary">
                        <span className="font-semibold text-text-primary">
                          Groq sampled-frame observation:{" "}
                        </span>
                        <span>{shot.groqEnrichment}</span>
                      </div>
                    )}

                  {shot.geminiNotes && (
                    <p className="text-[11px] text-text-muted leading-relaxed">
                      <span className="font-semibold text-text-secondary">Timeline evidence: </span>
                      {shot.geminiNotes}
                    </p>
                  )}

                  {shot.warnings.length > 0 && (
                    <div className="rounded-lg bg-warning/10 border border-warning/25 px-3 py-1.5 text-[11px] text-warning space-y-0.5">
                      {shot.warnings.map((warn, wIdx) => (
                        <p key={wIdx}>Note: {warn}</p>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-text-muted italic">
              No distinct outfit shots were identified in the saved visual analysis.
            </p>
          )}
        </div>

        {/* =================================================================== */}
        {/* 3. CAMERA & FRAMING (Single separate section)                       */}
        {/* =================================================================== */}
        <div className="rounded-xl border border-card-border bg-card p-5 space-y-3 shadow-card">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-card-border/60 pb-3">
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-lg bg-primary/15 text-primary border border-primary/25">
                <Video className="h-4 w-4" />
              </span>
              <div>
                <h3 className="text-sm font-bold text-text-primary">
                  3. Camera & Framing
                </h3>
                <p className="text-[11px] text-text-muted">
                  Overall shot scale, camera stability, subject framing, and cut behavior
                </p>
              </div>
            </div>
          </div>

          <p className="text-xs sm:text-[13px] leading-relaxed text-text-primary">
            {cameraFramingText}
          </p>
        </div>

        {/* =================================================================== */}
        {/* SUPPORTING EVIDENCE: REPRESENTATIVE FRAME OBSERVATIONS (Collapsed)  */}
        {/* =================================================================== */}
        {scenes.length > 0 && (
          <div className="rounded-xl border border-card-border bg-card shadow-card overflow-hidden">
            <button
              type="button"
              onClick={() => setIsSupportingFramesOpen((prev) => !prev)}
              className="w-full flex items-center justify-between gap-3 px-5 py-3.5 text-left hover:bg-background-elevated/50 transition-colors cursor-pointer"
              aria-expanded={isSupportingFramesOpen}
            >
              <div className="flex items-center gap-2.5">
                <span className="p-1.5 rounded-lg bg-background-elevated text-text-secondary border border-card-border">
                  <Film className="h-3.5 w-3.5" />
                </span>
                <div>
                  <h4 className="text-xs sm:text-sm font-semibold text-text-primary">
                    Supporting Frame Evidence ({scenes.length} Sampled-Frame Observations)
                  </h4>
                  <p className="text-[11px] text-text-muted">
                    Individual Groq observations from sampled frames only — supporting evidence, not separate shots or outfit changes
                  </p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 text-[11px] font-mono text-text-muted shrink-0">
                <span>{isSupportingFramesOpen ? "Hide" : "Show"}</span>
                {isSupportingFramesOpen ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </span>
            </button>

            {isSupportingFramesOpen && (
              <div className="border-t border-card-border/70 p-4 sm:p-5 space-y-3 bg-background-elevated/25">
                {scenes.map((scene, idx) => (
                  <div
                    key={`frame-obs-${scene.scene_number}-${idx}`}
                    className="rounded-lg border border-card-border bg-card p-3.5 space-y-2 text-xs"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="rounded bg-background-elevated px-2 py-0.5 text-[10px] font-mono font-semibold text-text-secondary border border-card-border">
                          Sampled-Frame Observation
                        </span>
                        <button
                          type="button"
                          onClick={() => onSeek(scene.start_time_seconds)}
                          className="inline-flex items-center gap-1 rounded bg-primary/10 hover:bg-primary/20 text-primary border border-primary/25 px-2 py-0.5 font-mono text-[11px] font-semibold transition-colors cursor-pointer"
                          title="Seek video to sampled timestamp"
                        >
                          <Play className="h-2.5 w-2.5 fill-current" />
                          <span>
                            {formatPreciseTimeRange(
                              scene.start_time_seconds,
                              scene.end_time_seconds
                            )}
                          </span>
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          handleCopyRow(`obs-${idx}`, scene.scene_description || "")
                        }
                        className="p-1 rounded text-text-muted hover:text-text-primary hover:bg-background-elevated transition-colors"
                        title="Copy observation"
                      >
                        {copiedSceneId === `obs-${idx}` ? (
                          <Check className="h-3.5 w-3.5 text-success" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>

                    <p className="text-text-primary leading-relaxed">
                      {scene.scene_description || "Not clearly visible"}
                    </p>

                    {scene.visible_subjects && scene.visible_subjects.length > 0 && (
                      <div className="text-[11px] text-text-secondary space-y-0.5">
                        {scene.visible_subjects.map((subj, sIdx) => (
                          <p key={sIdx}>
                            <span className="font-semibold text-text-primary">
                              {subj.subject_label}:{" "}
                            </span>
                            {subj.visible_action || "Observed in frame"}
                            {subj.clothing ? ` — ${subj.clothing}` : ""}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* =================================================================== */}
        {/* TECHNICAL DETAILS & PIPELINE METADATA (Collapsed by default)        */}
        {/* =================================================================== */}
        <div className="rounded-xl border border-card-border bg-card shadow-card overflow-hidden">
          <button
            type="button"
            onClick={() => setIsTechnicalDetailsOpen((prev) => !prev)}
            className="w-full flex items-center justify-between gap-3 px-5 py-3.5 text-left hover:bg-background-elevated/50 transition-colors cursor-pointer"
            aria-expanded={isTechnicalDetailsOpen}
          >
            <div className="flex items-center gap-2.5">
              <span className="p-1.5 rounded-lg bg-background-elevated text-text-secondary border border-card-border">
                <Info className="h-3.5 w-3.5" />
              </span>
              <div>
                <h4 className="text-xs sm:text-sm font-semibold text-text-primary">
                  Technical Details, Pipeline Status & Provider Scope
                </h4>
                <p className="text-[11px] text-text-muted">
                  Sequential Gemini/Groq step statuses, color palette, sampling timestamps, and limitations
                </p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1 text-[11px] font-mono text-text-muted shrink-0">
              <span>{isTechnicalDetailsOpen ? "Hide" : "Show"}</span>
              {isTechnicalDetailsOpen ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </span>
          </button>

          {isTechnicalDetailsOpen && (
            <div className="border-t border-card-border/70 p-4 sm:p-5 space-y-5 bg-background-elevated/20">
              {hasStepMetadata && renderTwoStepProgressCard(true)}

              {/* Video Overview & Visual Composition */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="rounded-lg bg-card p-3.5 border border-card-border space-y-1.5">
                  <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider block">
                    Synthesized Overview
                  </span>
                  <p className="text-text-secondary leading-relaxed">
                    {overview?.summary ||
                      geminiStep1Data?.summary ||
                      "Synthesized from saved visual analysis records."}
                  </p>
                </div>

                <div className="rounded-lg bg-card p-3.5 border border-card-border space-y-2">
                  <div className="flex items-center gap-1.5 text-[10px] font-semibold text-text-muted uppercase tracking-wider">
                    <Palette className="h-3 w-3 text-primary" />
                    <span>Dominant Color Tones</span>
                  </div>
                  {allColours.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {allColours.map((col, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1.5 rounded-md bg-background-elevated px-2 py-0.5 text-[11px] font-medium text-text-primary border border-card-border"
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                          <span>{col}</span>
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-text-muted italic text-[11px]">
                      No dominant colors recorded
                    </p>
                  )}
                </div>
              </div>

              {/* Submitted Frames & Sampling Coverage */}
              {(resolvedFrameCount > 0 ||
                resolvedSubmittedFrames.length > 0 ||
                showCoverageTelemetry) && (
                <div className="rounded-lg bg-card p-3.5 border border-card-border space-y-2.5">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">
                      Sampling Coverage ({resolvedFrameCount} frames · max 30 ceiling)
                    </span>
                    <span className="text-[11px] font-mono text-text-muted">
                      Click any timestamp to seek video
                    </span>
                  </div>

                  {showCoverageTelemetry && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-0.5 text-[11px]">
                      <div className="rounded bg-background-elevated px-2.5 py-1.5 border border-card-border">
                        <span className="text-[10px] text-text-muted block">Actual Duration</span>
                        <span className="font-mono font-semibold text-text-primary">
                          {resolvedActualDuration !== null
                            ? `${resolvedActualDuration.toFixed(2)}s`
                            : "—"}
                        </span>
                      </div>
                      <div className="rounded bg-background-elevated px-2.5 py-1.5 border border-card-border">
                        <span className="text-[10px] text-text-muted block">First Timestamp</span>
                        <span className="font-mono font-semibold text-text-primary">
                          {resolvedFirstTimestamp !== null
                            ? `${resolvedFirstTimestamp.toFixed(2)}s`
                            : "—"}
                        </span>
                      </div>
                      <div className="rounded bg-background-elevated px-2.5 py-1.5 border border-card-border">
                        <span className="text-[10px] text-text-muted block">Last Timestamp</span>
                        <span className="font-mono font-semibold text-text-primary">
                          {resolvedLastTimestamp !== null
                            ? `${resolvedLastTimestamp.toFixed(2)}s`
                            : "—"}
                        </span>
                      </div>
                      <div className="rounded bg-background-elevated px-2.5 py-1.5 border border-card-border">
                        <span className="text-[10px] text-text-muted block">Opening Frame</span>
                        <span
                          className={cn(
                            "font-mono font-semibold",
                            resolvedOpeningCovered === true
                              ? "text-success"
                              : resolvedOpeningCovered === false
                              ? "text-warning"
                              : "text-text-secondary"
                          )}
                        >
                          {resolvedOpeningCovered === true
                            ? "Covered"
                            : resolvedOpeningCovered === false
                            ? "Failed / Missing"
                            : "Recorded on extraction"}
                        </span>
                      </div>
                      <div className="rounded bg-background-elevated px-2.5 py-1.5 border border-card-border">
                        <span className="text-[10px] text-text-muted block">Final Frame</span>
                        <span
                          className={cn(
                            "font-mono font-semibold",
                            resolvedEndCovered === true
                              ? "text-success"
                              : resolvedEndCovered === false
                              ? "text-warning"
                              : "text-text-secondary"
                          )}
                        >
                          {resolvedEndCovered === true
                            ? "Covered"
                            : resolvedEndCovered === false
                            ? "Failed / Missing"
                            : "Recorded on extraction"}
                        </span>
                      </div>
                      <div className="rounded bg-background-elevated px-2.5 py-1.5 border border-card-border">
                        <span className="text-[10px] text-text-muted block">30-Frame Limit</span>
                        <span
                          className={cn(
                            "font-mono font-semibold",
                            resolvedLimitReached ? "text-warning" : "text-text-primary"
                          )}
                        >
                          {resolvedLimitReached ? "Reached" : "Within limit"}
                        </span>
                      </div>
                    </div>
                  )}

                  {resolvedSubmittedFrames.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {resolvedSubmittedFrames.map((frame, idx) => (
                        <button
                          key={`${frame.path}-${idx}`}
                          type="button"
                          onClick={() => onSeek(frame.timestamp_seconds)}
                          className="inline-flex items-center gap-1 rounded bg-primary/10 hover:bg-primary/20 text-primary border border-primary/25 px-2 py-0.5 font-mono text-[11px] font-semibold transition-colors cursor-pointer"
                          title={`Seek to timestamp (${frame.timestamp_seconds}s)`}
                        >
                          <Play className="h-2.5 w-2.5 fill-current" />
                          <span>
                            {formatSecondsToPreciseTimestamp(frame.timestamp_seconds)}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {resolvedEndpointWarning && (
                <div className="rounded-lg bg-warning/10 border border-warning/30 p-3.5 text-xs text-text-primary flex items-start gap-2.5">
                  <AlertTriangle className="h-4 w-4 text-warning shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <span className="font-semibold text-warning block">
                      {resolvedEndCovered === false
                        ? "Final Frame Coverage Incomplete"
                        : "Endpoint Frame Coverage Warning"}
                    </span>
                    <p className="text-text-secondary leading-relaxed">
                      {resolvedEndpointWarning}
                    </p>
                  </div>
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

              <div className="rounded-lg bg-card p-3.5 text-xs leading-relaxed text-text-secondary border border-card-border space-y-2">
                <p>
                  <strong className="text-text-primary">Provider Scope: </strong>
                  Gemini analyzes the uploaded original video to establish the chronological outfit timeline. Groq enriches individual looks using only the sampled representative JPEG frames and never analyzes the complete video.
                </p>
                <p className="text-[11px] text-text-muted">
                  Evidence policy: Timestamps remain chronological, unsampled intervals are not fabricated, and technical camera hardware or unidentifiable people are never invented.
                </p>
              </div>

              {metadata.warnings && metadata.warnings.length > 0 && (
                <div className="space-y-1.5">
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
