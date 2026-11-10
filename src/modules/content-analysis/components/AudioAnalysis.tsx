import React, { useState } from "react";
import {
  Volume2,
  Mic,
  Music,
  Copy,
  Check,
  Play,
  Gauge,
  Sliders,
  Sparkles,
  ShieldCheck,
  Disc,
} from "lucide-react";
import { AudioAnalysisData } from "../types/analysis";
import { Button } from "@/components/buttons";
import { cn } from "@/utils/cn";

interface AudioAnalysisProps {
  data: AudioAnalysisData;
  onSeek: (seconds: number) => void;
}

export const AudioAnalysis: React.FC<AudioAnalysisProps> = ({ data, onSeek }) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedFull, setCopiedFull] = useState(false);

  const handleCopySegment = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const handleCopyFullTranscript = () => {
    const fullText = data.segments.map((s) => `[${s.timestamp}] ${s.speaker}: ${s.spokenText}`).join("\n");
    navigator.clipboard.writeText(fullText);
    setCopiedFull(true);
    setTimeout(() => setCopiedFull(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Cards: Voice Profile & Acoustic Separation */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Voice Profile Card */}
        <div className="rounded-xl border border-card-border bg-card p-5 space-y-4 shadow-card">
          <div className="flex items-center justify-between border-b border-card-border/70 pb-3">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-lg bg-primary/15 text-primary border border-primary/25">
                <Mic className="h-4 w-4" />
              </span>
              <div>
                <h3 className="text-sm font-bold text-text-primary">Voice Characteristics</h3>
                <p className="text-[11px] text-text-muted">Acoustic speaker biometric breakdown</p>
              </div>
            </div>
            <span className="text-xs font-mono text-primary font-semibold">
              {data.language.detected} ({data.language.confidence}%)
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-background-elevated p-2.5 rounded-lg border border-card-border">
              <span className="text-[10px] text-text-muted uppercase font-semibold">Vocal Tone</span>
              <p className="font-medium text-text-primary mt-0.5">{data.voice.tone}</p>
            </div>
            <div className="bg-background-elevated p-2.5 rounded-lg border border-card-border">
              <span className="text-[10px] text-text-muted uppercase font-semibold">Speaking Pace</span>
              <p className="font-medium text-text-primary mt-0.5">
                {data.voice.paceWpm} WPM ({data.voice.paceDescription})
              </p>
            </div>
            <div className="bg-background-elevated p-2.5 rounded-lg border border-card-border">
              <span className="text-[10px] text-text-muted uppercase font-semibold">Dominant Emotion</span>
              <p className="font-medium text-text-primary mt-0.5">{data.voice.primaryEmotion}</p>
            </div>
            <div className="bg-background-elevated p-2.5 rounded-lg border border-card-border">
              <span className="text-[10px] text-text-muted uppercase font-semibold">Accent & Dialect</span>
              <p className="font-medium text-text-primary mt-0.5">{data.voice.accent || "Standard Broadcast"}</p>
            </div>
          </div>

          <div className="rounded-lg bg-background/50 p-2.5 text-[11px] text-text-secondary border border-card-border/60">
            <strong className="text-text-primary font-semibold">Projection:</strong> {data.voice.vocalProjection}
          </div>
        </div>

        {/* Background Audio Card */}
        <div className="rounded-xl border border-card-border bg-card p-5 space-y-4 shadow-card">
          <div className="flex items-center justify-between border-b border-card-border/70 pb-3">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-lg bg-trust/15 text-trust border border-trust/25">
                <Music className="h-4 w-4" />
              </span>
              <div>
                <h3 className="text-sm font-bold text-text-primary">Background Audio & SFX</h3>
                <p className="text-[11px] text-text-muted">Stem separation and musical bed analysis</p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1 rounded bg-success/15 px-2 py-0.5 text-[11px] font-medium text-success border border-success/20">
              <ShieldCheck className="h-3 w-3" />
              Separation: {data.backgroundAudio.audioSeparationQuality}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-background-elevated p-2.5 rounded-lg border border-card-border">
              <span className="text-[10px] text-text-muted uppercase font-semibold">Track Identified</span>
              <p className="font-medium text-text-primary mt-0.5 truncate" title={data.backgroundAudio.trackIdentified}>
                {data.backgroundAudio.trackIdentified || "Ambient Instrumental"}
              </p>
            </div>
            <div className="bg-background-elevated p-2.5 rounded-lg border border-card-border">
              <span className="text-[10px] text-text-muted uppercase font-semibold">Tempo / Beat Grid</span>
              <p className="font-medium text-text-primary mt-0.5">
                {data.backgroundAudio.tempoBpm ? `${data.backgroundAudio.tempoBpm} BPM` : "Dynamic Tempo"}
              </p>
            </div>
          </div>

          <div className="space-y-1.5">
            <span className="text-[11px] font-semibold text-text-muted uppercase">Detected Sound Effects (SFX):</span>
            <div className="flex flex-wrap gap-1.5">
              {data.backgroundAudio.sfxElements.map((sfx, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => onSeek(sfx.seconds)}
                  className="inline-flex items-center gap-1.5 rounded-md bg-background-elevated hover:bg-card-border px-2 py-1 text-[11px] text-text-secondary hover:text-text-primary border border-card-border transition-colors font-mono"
                  title={sfx.description}
                >
                  <Disc className="h-3 w-3 text-primary" />
                  <span>{sfx.timestamp}: {sfx.name}</span>
                </button>
              ))}
            </div>
          </div>

          <p className="text-[11px] text-text-muted italic">
            {data.backgroundAudio.syncRating}
          </p>
        </div>
      </div>

      {/* Spoken Dialogue & Timestamped Audio Timeline */}
      <div className="rounded-xl border border-card-border bg-card p-5 space-y-4 shadow-card">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-card-border/80 pb-3">
          <div>
            <h3 className="text-base font-bold text-text-primary flex items-center gap-2">
              <Volume2 className="h-4 w-4 text-primary" />
              Spoken Dialogue Timeline ({data.segments.length} Speech Segments)
            </h3>
            <p className="text-xs text-text-muted mt-0.5">
              Exact spoken words with millisecond phoneme boundary alignment
            </p>
          </div>

          <Button
            variant="secondary"
            size="sm"
            onClick={handleCopyFullTranscript}
            leftIcon={copiedFull ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
          >
            {copiedFull ? "Copied All" : "Copy Full Transcript"}
          </Button>
        </div>

        {/* Audio Timeline List */}
        <div className="space-y-2.5">
          {data.segments.map((seg) => (
            <div
              key={seg.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl border border-card-border bg-background-elevated/70 hover:bg-background-elevated hover:border-primary/40 transition-all group"
            >
              <div className="flex items-start gap-3">
                <button
                  type="button"
                  onClick={() => onSeek(seg.startTime)}
                  className="mt-0.5 flex items-center gap-1.5 rounded-md bg-primary/10 hover:bg-primary/20 text-primary border border-primary/25 px-2 py-1 text-xs font-mono font-semibold transition-colors shrink-0 group-hover:shadow-glow-primary"
                  title="Click to seek video"
                >
                  <Play className="h-3 w-3 fill-current" />
                  <span>{seg.timestamp}</span>
                </button>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-semibold text-text-muted">
                      {seg.speaker}
                    </span>
                    <span className="rounded bg-card px-1.5 py-0.2 text-[10px] uppercase font-mono text-text-secondary border border-card-border">
                      {seg.audioType}
                    </span>
                    <span className="text-[10px] text-success font-mono">
                      {seg.confidence}% conf
                    </span>
                  </div>
                  <p className="text-sm font-medium text-text-primary leading-relaxed">
                    "{seg.spokenText}"
                  </p>
                  {seg.notes && (
                    <p className="text-[11px] text-warning italic">
                      Note: {seg.notes}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                <button
                  type="button"
                  onClick={() => handleCopySegment(seg.id, seg.spokenText)}
                  className="p-1.5 rounded-md text-text-muted hover:text-text-primary hover:bg-card transition-colors"
                  title="Copy phrase"
                  aria-label="Copy phrase"
                >
                  {copiedId === seg.id ? (
                    <Check className="h-4 w-4 text-success" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
