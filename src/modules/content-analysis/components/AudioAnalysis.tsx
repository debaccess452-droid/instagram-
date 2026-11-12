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
  AlertTriangle,
  Loader2,
  Sparkles,
  RotateCcw,
  CheckCircle2,
  Info,
} from "lucide-react";
import {
  AudioAnalysisData,
  AudioBackendResult,
  AudioAnalysisStatus,
  BackgroundAudioInfo,
} from "../types/analysis";
import { Button } from "@/components/buttons";
import { cn } from "@/utils/cn";

export interface AudioAnalysisProps {
  data?: AudioAnalysisData; // benchmark demo data fallback
  realData?: AudioBackendResult | null; // real Supabase Edge Function result
  onSeek: (seconds: number) => void;
  isDemoData?: boolean;
  status?: AudioAnalysisStatus | null;
  errorMessage?: string | null;
  onRetry?: () => void;
  onAnalyzeAudio?: () => void;
  isProcessing?: boolean;
}

interface MusicDetectionResult {
  status: "Background music detected." | "No distinct background music detected." | "Unable to determine.";
  description?: string;
  badgeType: "detected" | "none" | "uncertain";
}

function evaluateBackgroundMusic(bg: BackgroundAudioInfo | undefined): MusicDetectionResult {
  if (!bg) {
    return {
      status: "Unable to determine.",
      badgeType: "uncertain",
    };
  }

  if (bg.hasMusicDetected === false) {
    return {
      status: "No distinct background music detected.",
      badgeType: "none",
    };
  }

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

export const AudioAnalysis: React.FC<AudioAnalysisProps> = ({
  data,
  realData,
  onSeek,
  isDemoData = false,
  status,
  errorMessage,
  onRetry,
  onAnalyzeAudio,
  isProcessing = false,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedTranscript, setCopiedTranscript] = useState(false);
  const [copiedFull, setCopiedFull] = useState(false);

  // 1. Processing State
  if (isProcessing || status === "processing") {
    return (
      <div className="rounded-2xl border border-primary/30 bg-card p-8 sm:p-12 shadow-card text-center space-y-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 text-primary mx-auto">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
        <div className="max-w-md mx-auto space-y-2">
          <h3 className="text-lg font-bold text-text-primary">
            Analyzing Reel Audio with Gemini AI
          </h3>
          <p className="text-xs text-text-secondary leading-relaxed">
            Extracting verbatim spoken dialogue, identifying primary and secondary languages,
            evaluating audible vocal characteristics, and scanning for background music and sound effects.
          </p>
          <div className="pt-2 text-[11px] font-mono text-text-muted flex items-center justify-center gap-2">
            <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            <span>Processing via analyze-audio Edge Function • Please keep this page open</span>
          </div>
        </div>
      </div>
    );
  }

  // 2. Failed State with Retry Action
  if (status === "failed" || errorMessage) {
    return (
      <div className="rounded-2xl border border-error/30 bg-card p-6 sm:p-8 shadow-card space-y-4">
        <div className="flex items-start gap-3.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-error/15 text-error shrink-0 border border-error/25">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div className="space-y-1 flex-1">
            <h3 className="text-base font-bold text-text-primary">
              Audio Analysis Failed
            </h3>
            <p className="text-xs text-error leading-relaxed">
              {errorMessage || "The backend encountered an error while processing audio from your Reel."}
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
              Retry Audio Analysis
            </Button>
          </div>
        )}
      </div>
    );
  }

  // 3. Pending / Not Analyzed State
  if (!realData && !data && (status === "pending" || !status)) {
    return (
      <div className="rounded-2xl border border-card-border bg-card p-8 sm:p-10 shadow-card text-center space-y-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 text-primary mx-auto">
          <Sparkles className="h-8 w-8" />
        </div>
        <div className="max-w-md mx-auto space-y-2">
          <h3 className="text-lg font-bold text-text-primary">
            Ready for Audio Intelligence
          </h3>
          <p className="text-xs text-text-secondary leading-relaxed">
            Your Reel is stored in private Supabase Storage. Run the Gemini AI Audio Analysis pipeline
            to extract the full transcript, detect language, analyze vocal presentation, and identify music & SFX.
          </p>
        </div>
        {onAnalyzeAudio && (
          <div className="pt-2">
            <Button
              variant="primary"
              size="lg"
              onClick={onAnalyzeAudio}
              leftIcon={<Sparkles className="h-5 w-5" />}
              className="shadow-glow-primary py-3 px-6"
            >
              Analyze Audio
            </Button>
          </div>
        )}
      </div>
    );
  }

  // =========================================================================
  // REAL BACKEND DATA RENDERING (AudioBackendResult)
  // =========================================================================
  if (realData) {
    const fullTranscript = realData.spoken_dialogue?.full_transcript?.trim() || "";
    const spokenLanguage = realData.spoken_dialogue?.language || "Not specified";
    const primaryLanguage = realData.language_detection?.primary_language || "Not detected";
    const additionalLangs = realData.language_detection?.additional_languages || [];
    const voiceCharacteristics = realData.voice_characteristics || [];
    const bgMusic = realData.background_music;
    const soundEffects = realData.sound_effects || [];
    const timestampedTranscript = realData.timestamped_transcript || [];
    const warnings = realData.analysis_metadata?.warnings || [];

    const handleCopyRealTranscript = () => {
      navigator.clipboard.writeText(fullTranscript);
      setCopiedTranscript(true);
      setTimeout(() => setCopiedTranscript(false), 2000);
    };

    const handleCopyFullTimestamped = () => {
      const text = timestampedTranscript
        .map(
          (t) =>
            `[${formatTimeRange(t.start_time_seconds, t.end_time_seconds)}] ${
              t.speaker_label ? `${t.speaker_label}: ` : ""
            }${t.spoken_text}`
        )
        .join("\n");
      navigator.clipboard.writeText(text);
      setCopiedFull(true);
      setTimeout(() => setCopiedFull(false), 2000);
    };

    const handleCopyLine = (idx: number, lineText: string) => {
      navigator.clipboard.writeText(lineText);
      setCopiedId(`line-${idx}`);
      setTimeout(() => setCopiedId(null), 1800);
    };

    return (
      <div className="space-y-6">
        {/* Backend Warnings (if any) */}
        {warnings.length > 0 && (
          <div className="rounded-xl border border-amber-500/25 bg-amber-500/10 p-4 text-xs text-amber-300 space-y-1">
            <div className="flex items-center gap-2 font-semibold">
              <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />
              <span>Audio Analysis Notice:</span>
            </div>
            <ul className="list-disc list-inside space-y-0.5 text-[11px] text-amber-200/90 pl-1">
              {warnings.map((w, idx) => (
                <li key={idx}>{w}</li>
              ))}
            </ul>
          </div>
        )}

        {/* ========================================================================= */}
        {/* A. SPOKEN DIALOGUE (Component 1)                                          */}
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
                    <CheckCircle2 className="h-3 w-3" />
                    Complete Transcript
                  </span>
                </div>
                <p className="text-[11px] text-text-muted">
                  Complete original spoken transcript extracted from the Reel ({spokenLanguage})
                </p>
              </div>
            </div>

            {fullTranscript && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyRealTranscript}
                leftIcon={
                  copiedTranscript ? (
                    <Check className="h-3.5 w-3.5 text-success" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )
                }
              >
                {copiedTranscript ? "Copied" : "Copy Transcript"}
              </Button>
            )}
          </div>

          <div className="rounded-lg bg-background-elevated/70 p-4 border border-card-border">
            {fullTranscript ? (
              <p className="text-sm sm:text-base leading-relaxed text-text-primary font-normal whitespace-pre-wrap">
                "{fullTranscript}"
              </p>
            ) : (
              <p className="text-xs text-text-muted italic py-1">
                No spoken dialogue detected in this video.
              </p>
            )}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* B, C, D: METRICS GRID (Language, Voice, Music, Sound Effects)             */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* B. Language Detection */}
          <div className="rounded-xl border border-card-border bg-card p-4 space-y-2.5 shadow-card">
            <div className="flex items-center justify-between border-b border-card-border/60 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-primary/15 text-primary border border-primary/25">
                  <Globe className="h-4 w-4" />
                </span>
                <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted">
                  Language Detection
                </h4>
              </div>
              <span className="inline-flex items-center gap-1 rounded bg-success/15 px-2 py-0.5 text-[10px] font-semibold text-success border border-success/20">
                <Check className="h-3 w-3" />
                Detected
              </span>
            </div>

            <div className="space-y-1.5 pt-1">
              <div>
                <span className="text-[11px] text-text-muted">Primary Language: </span>
                <span className="text-sm font-bold text-text-primary">
                  {primaryLanguage || "Not detected"}
                </span>
              </div>
              <div className="text-xs">
                <span className="text-text-muted">Additional Languages: </span>
                <span className="text-text-secondary font-medium">
                  {additionalLangs.length > 0 ? additionalLangs.join(", ") : "None detected"}
                </span>
              </div>
            </div>
          </div>

          {/* C. Voice Characteristics */}
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
                {voiceCharacteristics.length} {voiceCharacteristics.length === 1 ? "Speaker" : "Speakers"}
              </span>
            </div>

            <div className="pt-0.5 space-y-3">
              {voiceCharacteristics.length === 0 ? (
                <p className="text-xs text-text-muted italic py-1">
                  No distinct voice characteristics detected.
                </p>
              ) : (
                voiceCharacteristics.map((vc, idx) => (
                  <div
                    key={idx}
                    className="space-y-1.5 text-xs pb-2 border-b border-card-border/50 last:border-b-0 last:pb-0"
                  >
                    {vc.speaker_label && (
                      <div className="font-semibold text-primary text-[11px] uppercase tracking-wider">
                        {vc.speaker_label}
                      </div>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      {vc.tone && (
                        <div>
                          <span className="text-text-muted">Tone: </span>
                          <span className="text-text-primary font-medium">{vc.tone}</span>
                        </div>
                      )}
                      {vc.pace && (
                        <div>
                          <span className="text-text-muted">Pace: </span>
                          <span className="text-text-primary font-medium">{vc.pace}</span>
                        </div>
                      )}
                      {vc.delivery_style && (
                        <div>
                          <span className="text-text-muted">Delivery: </span>
                          <span className="text-text-primary font-medium">{vc.delivery_style}</span>
                        </div>
                      )}
                      {vc.emotional_expression && (
                        <div>
                          <span className="text-text-muted">Expression: </span>
                          <span className="text-text-primary font-medium">{vc.emotional_expression}</span>
                        </div>
                      )}
                    </div>
                    {vc.perceived_voice_presentation && (
                      <div className="text-[11px] text-text-secondary">
                        <span className="text-text-muted">Presentation: </span>
                        <span>{vc.perceived_voice_presentation}</span>
                      </div>
                    )}
                    {vc.evidence_notes && (
                      <div className="text-[11px] text-text-muted italic bg-background-elevated/50 p-1.5 rounded border border-card-border/40">
                        Evidence: {vc.evidence_notes}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* D. Background Music */}
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
                  bgMusic?.detected
                    ? "bg-success/15 text-success border-success/20"
                    : "bg-text-muted/15 text-text-secondary border-card-border"
                )}
              >
                {bgMusic?.detected ? "Detected" : "Not Detected"}
              </span>
            </div>

            <div className="space-y-1 pt-0.5">
              <p className="text-sm font-semibold text-text-primary">
                {bgMusic?.detected
                  ? "Background music detected."
                  : "No background music detected."}
              </p>
              {bgMusic?.description ? (
                <p className="text-xs text-text-secondary leading-relaxed">
                  {bgMusic.description}
                </p>
              ) : null}
            </div>
          </div>

          {/* E. Sound Effects */}
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
                {soundEffects.length} Identified
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
                        onClick={() => onSeek(sfx.start_time_seconds)}
                        className="font-mono text-primary hover:underline hover:text-primary-hover font-semibold shrink-0"
                        title="Seek video to this timestamp"
                      >
                        {formatTimeRange(sfx.start_time_seconds, sfx.end_time_seconds)}
                      </button>
                      <span className="text-text-muted">—</span>
                      <span className="text-text-primary font-medium">{sfx.description}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* E (Part 2). TIMESTAMPED TRANSCRIPT TABLE                                  */}
        {/* ========================================================================= */}
        <div className="rounded-xl border border-card-border bg-card p-5 space-y-4 shadow-card">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-card-border/80 pb-3">
            <div>
              <h3 className="text-base font-bold text-text-primary">
                Timestamped Transcript
              </h3>
              <p className="text-xs text-text-muted mt-0.5">
                Chronological transcript segments with clickable player seeking timestamps.
              </p>
            </div>

            {timestampedTranscript.length > 0 && (
              <Button
                variant="secondary"
                size="sm"
                onClick={handleCopyFullTimestamped}
                leftIcon={
                  copiedFull ? (
                    <Check className="h-3.5 w-3.5 text-success" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )
                }
              >
                {copiedFull ? "Copied All" : "Copy Full Timeline"}
              </Button>
            )}
          </div>

          <div className="overflow-x-auto rounded-lg border border-card-border">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-background-elevated border-b border-card-border text-[11px] uppercase tracking-wider text-text-muted font-semibold">
                <tr>
                  <th scope="col" className="w-36 sm:w-44 px-4 py-3">
                    Time
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Spoken Dialogue & Notes
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-card-border/60 bg-card">
                {timestampedTranscript.length === 0 ? (
                  <tr>
                    <td colSpan={2} className="px-4 py-8 text-center text-xs text-text-muted">
                      No timestamped transcript segments detected.
                    </td>
                  </tr>
                ) : (
                  timestampedTranscript.map((t, idx) => (
                    <tr
                      key={idx}
                      className="hover:bg-background-elevated/60 transition-colors group"
                    >
                      <td className="px-4 py-3 align-top whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => onSeek(t.start_time_seconds)}
                          className="inline-flex items-center gap-1.5 rounded bg-primary/10 hover:bg-primary/20 text-primary border border-primary/25 px-2 py-1 font-mono text-xs font-semibold transition-colors group-hover:border-primary/50"
                          title="Click to seek video player"
                        >
                          <Play className="h-3 w-3 fill-current" />
                          <span>{formatTimeRange(t.start_time_seconds, t.end_time_seconds)}</span>
                        </button>
                        {t.speaker_label && (
                          <div className="text-[10px] text-text-muted font-mono mt-1">
                            {t.speaker_label}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 align-top">
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1">
                            <p className="text-text-primary leading-relaxed font-medium">
                              {t.spoken_text}
                            </p>
                            {t.delivery_notes && (
                              <p className="text-[11px] text-text-secondary italic">
                                Note: {t.delivery_notes}
                              </p>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => handleCopyLine(idx, t.spoken_text)}
                            className="p-1 rounded text-text-muted hover:text-text-primary hover:bg-background-elevated transition-colors shrink-0"
                            title="Copy line"
                            aria-label="Copy spoken line"
                          >
                            {copiedId === `line-${idx}` ? (
                              <Check className="h-3.5 w-3.5 text-success" />
                            ) : (
                              <Copy className="h-3.5 w-3.5 opacity-60 group-hover:opacity-100" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // BENCHMARK DEMO PRESET FALLBACK (when exploring demo presets)
  // =========================================================================
  if (!data) {
    return null;
  }

  const fullTranscript = data.segments
    .map((s) => s.spokenText.trim())
    .filter(Boolean)
    .join(" ");

  const uncertainSegments = data.segments.filter(
    (s) =>
      s.clarity === "partially_muffled" ||
      s.clarity === "inaudible" ||
      (s.notes && s.notes.trim().length > 0)
  );

  const detectedLanguage = data.language?.detected || "English";
  const vocalTone = data.voice?.tone || "Casual and confident.";
  const speakingPace = data.voice?.paceDescription
    ? data.voice.paceDescription.charAt(0).toUpperCase() +
      data.voice.paceDescription.slice(1)
    : "Moderate";
  const speakingStyle = data.voice?.speakingStyle || "Conversational.";
  const musicInfo = evaluateBackgroundMusic(data.backgroundAudio);
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
      {/* Demo Benchmark Banner */}
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
            Sample Preset
          </span>
        </div>
      )}

      {/* Spoken Dialogue */}
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
            {copiedTranscript ? "Copied" : "Copy Transcript"}
          </Button>
        </div>

        <div className="rounded-lg bg-background-elevated/70 p-4 border border-card-border">
          <p className="text-sm sm:text-base leading-relaxed text-text-primary font-normal">
            "{fullTranscript || "No spoken dialogue detected in this video."}"
          </p>
        </div>

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

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Language */}
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

        {/* Voice Characteristics */}
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

        {/* Background Music */}
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

        {/* Sound Effects */}
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

      {/* Spoken Dialogue Timeline Table */}
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
