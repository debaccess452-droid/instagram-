import React, { useEffect, useState } from "react";
import {
  Sparkles,
  CheckCircle2,
  Loader2,
  Clock,
  Video,
  FileSpreadsheet,
  AlertCircle,
} from "lucide-react";
import { PROCESSING_STAGES } from "../services/contentAnalysisService";
import { cn } from "@/utils/cn";

interface AnalysisProgressModalProps {
  isOpen: boolean;
  onComplete: () => void;
  videoTitle?: string;
  onCancel?: () => void;
}

export const AnalysisProgressModal: React.FC<AnalysisProgressModalProps> = ({
  isOpen,
  onComplete,
  videoTitle = "Uploaded Reel",
  onCancel,
}) => {
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    if (!isOpen) {
      setCurrentStageIndex(0);
      setElapsedSeconds(0);
      return;
    }

    // Elapsed timer
    const timerInterval = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);

    // Stage progression: each stage advances after ~600ms - 900ms
    const stageInterval = setInterval(() => {
      setCurrentStageIndex((prev) => {
        if (prev < PROCESSING_STAGES.length - 1) {
          return prev + 1;
        } else {
          clearInterval(stageInterval);
          setTimeout(() => {
            onComplete();
          }, 800);
          return prev;
        }
      });
    }, 850);

    return () => {
      clearInterval(timerInterval);
      clearInterval(stageInterval);
    };
  }, [isOpen, onComplete]);

  if (!isOpen) return null;

  const currentStage = PROCESSING_STAGES[currentStageIndex];
  const progressPercent = Math.round(
    ((currentStageIndex + 1) / PROCESSING_STAGES.length) * 100
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-auth-fade-in">
      <div className="relative w-full max-w-xl rounded-2xl border border-card-border bg-gradient-to-b from-card via-background-elevated to-background p-6 sm:p-8 shadow-card-lg overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 h-44 w-44 rounded-full bg-primary/20 blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/20 text-primary">
                <Sparkles className="h-3 w-3 animate-spin" />
              </span>
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                Multimodal AI Pipeline Active
              </span>
            </div>
            <h3 className="text-xl font-bold text-text-primary">
              Analyzing Reel Structure
            </h3>
            <p className="text-xs text-text-secondary mt-0.5 line-clamp-1">
              {videoTitle}
            </p>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-mono text-text-secondary bg-background px-3 py-1.5 rounded-lg border border-card-border">
            <Clock className="h-3.5 w-3.5 text-primary" />
            <span>00:{elapsedSeconds.toString().padStart(2, "0")}s</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1.5 mb-6 relative z-10">
          <div className="flex justify-between text-xs font-medium">
            <span className="text-text-primary flex items-center gap-1.5">
              <span className="text-primary font-bold">
                Stage {currentStageIndex + 1} of {PROCESSING_STAGES.length}:
              </span>
              <span>{currentStage.label}</span>
            </span>
            <span className="text-primary font-mono font-semibold">
              {progressPercent}%
            </span>
          </div>
          <div className="h-2 w-full rounded-full bg-background overflow-hidden border border-card-border/60">
            <div
              className="h-full rounded-full bg-gradient-primary-trust transition-all duration-500 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="text-[11px] text-text-muted italic">{currentStage.detail}</p>
        </div>

        {/* Stages Checklist */}
        <div className="space-y-2 max-h-64 overflow-y-auto pr-1 relative z-10">
          {PROCESSING_STAGES.map((stage, idx) => {
            const isCompleted = idx < currentStageIndex;
            const isCurrent = idx === currentStageIndex;
            const isUpcoming = idx > currentStageIndex;

            return (
              <div
                key={stage.id}
                className={cn(
                  "flex items-center justify-between p-2.5 rounded-lg text-xs transition-all border",
                  isCompleted &&
                    "bg-success/5 border-success/20 text-text-primary",
                  isCurrent &&
                    "bg-primary/10 border-primary/40 text-text-primary shadow-sm",
                  isUpcoming &&
                    "bg-background/40 border-card-border/40 text-text-muted opacity-60"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-5 w-5 items-center justify-center shrink-0">
                    {isCompleted ? (
                      <CheckCircle2 className="h-4 w-4 text-success" />
                    ) : isCurrent ? (
                      <Loader2 className="h-4 w-4 text-primary animate-spin" />
                    ) : (
                      <div className="h-2 w-2 rounded-full bg-card-border" />
                    )}
                  </div>
                  <span
                    className={cn(
                      "font-medium",
                      isCurrent && "text-primary font-semibold"
                    )}
                  >
                    {stage.label}
                  </span>
                </div>

                <span className="text-[10px] uppercase tracking-wider font-mono">
                  {isCompleted
                    ? "Completed"
                    : isCurrent
                    ? "Processing..."
                    : "Queued"}
                </span>
              </div>
            );
          })}
        </div>

        {/* Demo Mode Notice */}
        <div className="mt-5 rounded-lg bg-background p-3 border border-card-border/80 flex items-start gap-2.5 text-[11px] text-text-muted relative z-10">
          <AlertCircle className="h-4 w-4 text-warning shrink-0 mt-0.5" />
          <p>
            <strong className="text-text-secondary font-medium">Pipeline Note:</strong>{" "}
            Running in frontend demonstration mode with simulated neural inference.
            Ready for direct production integration with multimodal Gemini 2.0 video processing endpoints.
          </p>
        </div>

        {/* Cancel Action */}
        {onCancel && (
          <div className="mt-4 flex justify-end relative z-10">
            <button
              type="button"
              onClick={onCancel}
              className="text-xs text-text-muted hover:text-text-primary transition-colors py-1 px-3"
            >
              Cancel Analysis
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
