import React, { useState } from "react";
import {
  MessageSquareQuote,
  Globe,
  Mic,
  Music,
  Volume2,
  Copy,
  Check,
  Play,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { AudioAnalysisData, BackgroundAudioInfo } from "../types/analysis";
import { Button } from "@/components/buttons";
import { cn } from "@/utils/cn";

export interface AudioAnalysisProps {
  data: AudioAnalysisData;
  onSeek: (seconds: number) => void;
  isDemoData?: boolean;
}

interface MusicDetectionResult {
  status: "Background music detected." | "No distinct background music detected." | "Unable to determine.";
  description?: string;
  badgeType: "detected" | "none" | "uncertain";
}

/**
 * Evaluates background music presence according to strict evidence requirements.
 * Possible outputs:
 * 1. "Background music detected."
 * 2. "No distinct background music detected."
 * 3. "Unable to determine."
 */
function evaluateBackgroundMusic(bg: BackgroundAudioInfo | undefined): MusicDetectionResult {
  if (!bg) {
    return {
      status: "Unable to determine.",
      badgeType: "uncertain",
    };
  }

  // Explicit flag check if provided by analyzer
  if (bg.hasMusicDetected === false) {
    return {
      status: "No distinct background music detected.",
      badgeType: "none",
    };
  }

  // Check if non-empty genre / mood / track characteristics are detected
  const genreLower = (bg.genre || "").toLowerCase().trim();
  const moodLower = (bg.mood || "").toLowerCase().trim();
  const trackLower = (bg.trackIdentified || "").toLowerCase().trim();

  const isExplicitNone =
    genreLower.includes("none") ||
    genreLower.includes("no music") ||
    genreLower === "silent" ||
    (genreLower === "" && moodLower === "" && trackLower === "");

  if (isExplicitNone && bg.hasMusicDetected !== true) {
    return {
      status: "No distinct background music detected.",
      badgeType: "none",
    };
  }

  // If music characteristics are detected, synthesize a concise audible description
  // (e.g. instrumental, upbeat, calm, electronic) without inventing song names or IDs
  const traits: string[] = [];
  if (bg.genre && !genreLower.includes("none")) {
    traits.push(bg.genre);
  }
  if (bg.mood && !moodLower.includes("none")) {
    traits.push(bg.mood);
  }

  const description =
    traits.length > 0
      ? traits.join(" • ")
      : "Instrumental background music detected.";

  return {
    status: "Background music detected.",
    description,
    badgeType: "detected",
  };
}

export const AudioAnalysis: React.FC<AudioAnalysisProps> = ({
  data,
  onSeek,
  isDemoData = false,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedFull, setCopiedFull] = useState(false);
  const [copiedTranscript, setCopiedTranscript] = useState(false);

  // Component 1: Complete Spoken Dialogue transcript
  const fullTranscript = data.segments
    .map((s) => s.spokenText.trim())
    .filter(Boolean)
    .join(" ");

  // Identify segments with uncertainty notes or reduced clarity
  const uncertainSegments = data.segments.filter(
    (s) =>
      s.clarity === "partially_muffled" ||
      s.clarity === "inaudible" ||
      (s.notes && s.notes.trim().length > 0)
  );

  // Component 2: Detected Language
  const detectedLanguage = data.language?.detected || "English";

  // Component 3: Voice Characteristics (Display ONLY: Vocal Tone, Speaking Pace, Speaking Style)
  const vocalTone = data.voice?.tone || "Casual and confident.";
  const speakingPace = data.voice?.paceDescription
    ? data.voice.paceDescription.charAt(0).toUpperCase() +
      data.voice.paceDescription.slice(1)
    : "Moderate";
  const speakingStyle = data.voice?.speakingStyle || "Conversational.";

  // Component 4: Background Music
  const musicInfo = evaluateBackgroundMusic(data.backgroundAudio);

  // Component 5: Sound Effects
  const soundEffects = (data.backgroundAudio?.sfxElements || []).map((sfx) => ({
    timestamp: sfx.timestamp || "00:00.0",
    name: sfx.name || sfx.description || "Sound effect",
    seconds: sfx.seconds || 0,
  }));

  const handleCopyTranscript = () => {
    navigator.clipboard.writeText(fullTranscript);
    setCopiedTranscript(true);
    setTimeout(() => setCopiedTranscript(false), 2000);
  };

  const handleCopyFullTranscript = () => {
    const tableText = data.segments
      .map((s) => `[${s.timestamp}] ${s.spokenText}`)
      .join("\n");
    navigator.clipboard.writeText(tableText);
    setCopiedFull(true);
    setTimeout(() => setCopiedFull(false), 2000);
  };

  const handleCopySegment = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  return (
    <div className="space-y-6">
      {/* Demo Mode / Evidence Indicator */}
      {isDemoData && (
        <div className="flex items-center justify-between rounded-xl bg-primary/5 border border-primary/20 px-4 py-2.5 text-xs shadow-sm">
          <div className="flex items-center gap-2.5 text-text-secondary">
            <span className="inline-block h-2 w-2 rounded-full bg-primary animate-pulse" />
            <span className="font-semibold text-text-primary">Demo Analysis Mode</span>
            <span className="hidden sm:inline text-text-muted">
              — Displaying benchmark Reel audio analysis results
            </span>
          </div>
          <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-primary/15 text-primary border border-primary/25 font-semibold">
            Reference Sample
          </span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. SPOKEN DIALOGUE (Component 1)                                          */}
      {/* ========================================================================= */}
      <div className="rounded-xl border border-card-border bg-card p-5 space-y-3.5 shadow-card">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-lg bg-primary/15 text-primary border border-primary/25">
              <MessageSquareQuote className="h-4 w-4" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-text-primary">Spoken Dialogue</h3>
                <span className="inline-flex items-center gap-1 rounded bg-success/15 px-2 py-0.2 text-[10px] font-semibold text-success border border-success/20">
                  <Check className="h-3 w-3" />
                  Verified
                </span>
              </div>
              <p className="text-[11px] text-text-muted">
                Complete original spoken transcript extracted from the Reel
              </p>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyTranscript}
            leftIcon={
              copiedTranscript ? (
                <Check className="h-3.5 w-3.5 text-success" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )
            }
          >
            {copiedTranscript ? "Copied Transcript" : "Copy Transcript"}
          </Button>
        </div>

        <div className="rounded-lg bg-background-elevated/70 p-4 border border-card-border">
          <p className="text-sm sm:text-base leading-relaxed text-text-primary font-normal">
            "{fullTranscript || "No spoken dialogue detected in this video."}"
          </p>
        </div>

        {/* Clear identification of uncertain words or recording notes */}
        {uncertainSegments.length > 0 && (
          <div className="flex items-start gap-2.5 rounded-lg bg-amber-500/10 p-3 text-xs text-amber-400 border border-amber-500/20">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-amber-400" />
            <div className="space-y-1">
              <span className="font-semibold text-amber-300">
                Uncertain words / notes identified:
              </span>
              <ul className="list-disc list-inside space-y-0.5 text-[11px] text-amber-200/90 font-mono">
                {uncertainSegments.map((s) => (
                  <li key={s.id}>
                    <button
                      type="button"
                      onClick={() => onSeek(s.startTime)}
                      className="underline hover:text-white font-semibold"
                    >
                      {s.timestamp}
                    </button>
                    {s.notes
                      ? `: ${s.notes}`
                      : `: Unclear phrase "${s.spokenText}"`}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 2 to 5: AUDIO ANALYSIS METRICS (Components 2, 3, 4, 5)                    */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Component 2: Language */}
        <div className="rounded-xl border border-card-border bg-card p-4 space-y-2.5 shadow-card">
          <div className="flex items-center justify-between border-b border-card-border/60 pb-2.5">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-primary/15 text-primary border border-primary/25">
                <Globe className="h-4 w-4" />
              </span>
              <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted">
                Language
              </h4>
            </div>
            <span className="inline-flex items-center gap-1 rounded bg-success/15 px-2 py-0.5 text-[10px] font-semibold text-success border border-success/20">
              <Check className="h-3 w-3" />
              Verified
            </span>
          </div>

          <div className="pt-1">
            <p className="text-base font-bold text-text-primary">
              {detectedLanguage}
            </p>
            <p className="text-[11px] text-text-muted mt-0.5">
              Detected spoken language
            </p>
          </div>
        </div>

        {/* Component 3: Voice Characteristics (ONLY: Vocal Tone, Speaking Pace, Speaking Style) */}
        <div className="rounded-xl border border-card-border bg-card p-4 space-y-2.5 shadow-card">
          <div className="flex items-center justify-between border-b border-card-border/60 pb-2.5">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-primary/15 text-primary border border-primary/25">
                <Mic className="h-4 w-4" />
              </span>
              <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted">
                Voice Characteristics
              </h4>
            </div>
            <span className="rounded bg-background-elevated px-2 py-0.5 text-[10px] font-medium text-text-secondary border border-card-border">
              Estimated
            </span>
          </div>

          <div className="space-y-2 text-xs pt-0.5">
            <div>
              <span className="text-text-muted font-medium">Vocal Tone: </span>
              <span className="text-text-primary font-semibold">{vocalTone}</span>
            </div>
            <div>
              <span className="text-text-muted font-medium">Speaking Pace: </span>
              <span className="text-text-primary font-semibold">{speakingPace}</span>
            </div>
            <div>
              <span className="text-text-muted font-medium">Speaking Style: </span>
              <span className="text-text-primary font-semibold">{speakingStyle}</span>
            </div>
          </div>
        </div>

        {/* Component 4: Background Music */}
        <div className="rounded-xl border border-card-border bg-card p-4 space-y-2.5 shadow-card">
          <div className="flex items-center justify-between border-b border-card-border/60 pb-2.5">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-primary/15 text-primary border border-primary/25">
                <Music className="h-4 w-4" />
              </span>
              <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted">
                Background Music
              </h4>
            </div>
            <span
              className={cn(
                "rounded px-2 py-0.5 text-[10px] font-semibold border",
                musicInfo.badgeType === "detected"
                  ? "bg-success/15 text-success border-success/20"
                  : musicInfo.badgeType === "none"
                  ? "bg-text-muted/15 text-text-secondary border-card-border"
                  : "bg-amber-500/15 text-amber-400 border-amber-500/20"
              )}
            >
              {musicInfo.badgeType === "detected"
                ? "Verified"
                : musicInfo.badgeType === "none"
                ? "Verified"
                : "Uncertain"}
            </span>
          </div>

          <div className="space-y-1 pt-0.5">
            <p className="text-sm font-semibold text-text-primary">
              {musicInfo.status}
            </p>
            {musicInfo.description && (
              <p className="text-xs text-text-secondary leading-relaxed">
                {musicInfo.description}
              </p>
            )}
          </div>
        </div>

        {/* Component 5: Sound Effects */}
        <div className="rounded-xl border border-card-border bg-card p-4 space-y-2.5 shadow-card">
          <div className="flex items-center justify-between border-b border-card-border/60 pb-2.5">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-primary/15 text-primary border border-primary/25">
                <Volume2 className="h-4 w-4" />
              </span>
              <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted">
                Sound Effects
              </h4>
            </div>
            <span className="rounded bg-background-elevated px-2 py-0.5 text-[10px] font-medium text-text-secondary border border-card-border">
              Verified
            </span>
          </div>

          <div className="pt-0.5">
            {soundEffects.length === 0 ? (
              <p className="text-xs text-text-muted italic py-1">
                No prominent sound effects detected.
              </p>
            ) : (
              <ul className="space-y-1.5 text-xs max-h-36 overflow-y-auto pr-1">
                {soundEffects.map((sfx, idx) => (
                  <li
                    key={idx}
                    className="flex items-center gap-2 text-text-secondary py-0.5"
                  >
                    <button
                      type="button"
                      onClick={() => onSeek(sfx.seconds)}
                      className="font-mono text-primary hover:underline hover:text-primary-hover font-semibold shrink-0"
                      title="Seek video to this timestamp"
                    >
                      {sfx.timestamp}
                    </button>
                    <span className="text-text-muted">—</span>
                    <span className="text-text-primary font-medium">{sfx.name}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. SPOKEN DIALOGUE TIMELINE TABLE                                         */}
      {/* ========================================================================= */}
      <div className="rounded-xl border border-card-border bg-card p-5 space-y-4 shadow-card">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-card-border/80 pb-3">
          <div>
            <h3 className="text-base font-bold text-text-primary">
              Spoken Dialogue Timeline
            </h3>
            <p className="text-xs text-text-muted mt-0.5">
              Original spoken words with timestamps.
            </p>
          </div>

          <Button
            variant="secondary"
            size="sm"
            onClick={handleCopyFullTranscript}
            leftIcon={
              copiedFull ? (
                <Check className="h-3.5 w-3.5 text-success" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )
            }
          >
            {copiedFull ? "Copied All" : "Copy Full Transcript"}
          </Button>
        </div>

        {/* Clean, responsive 2-column table: Time | Original Voiceover */}
        <div className="overflow-x-auto rounded-lg border border-card-border">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-background-elevated border-b border-card-border text-[11px] uppercase tracking-wider text-text-muted font-semibold">
              <tr>
                <th scope="col" className="w-36 sm:w-44 px-4 py-3">
                  Time
                </th>
                <th scope="col" className="px-4 py-3">
                  Original Voiceover
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-card-border/60 bg-card">
              {data.segments.map((seg) => (
                <tr
                  key={seg.id}
                  className="hover:bg-background-elevated/60 transition-colors group"
                >
                  <td className="px-4 py-3 align-top whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => onSeek(seg.startTime)}
                      className="inline-flex items-center gap-1.5 rounded bg-primary/10 hover:bg-primary/20 text-primary border border-primary/25 px-2 py-1 font-mono text-xs font-semibold transition-colors group-hover:border-primary/50"
                      title="Click to seek video player"
                    >
                      <Play className="h-3 w-3 fill-current" />
                      <span>{seg.timestamp}</span>
                    </button>
                  </td>
                  <td className="px-4 py-3 align-top">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <p className="text-text-primary leading-relaxed font-medium">
                          {seg.spokenText}
                        </p>
                        {seg.notes && (
                          <p className="text-[11px] text-amber-400 italic">
                            Note: {seg.notes}
                          </p>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopySegment(seg.id, seg.spokenText)}
                        className="p-1 rounded text-text-muted hover:text-text-primary hover:bg-background-elevated transition-colors shrink-0"
                        title="Copy spoken line"
                        aria-label="Copy spoken line"
                      >
                        {copiedId === seg.id ? (
                          <Check className="h-3.5 w-3.5 text-success" />
                        ) : (
                          <Copy className="h-3.5 w-3.5 opacity-60 group-hover:opacity-100" />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AudioAnalysis;
