import React from "react";
import {
  ShieldCheck,
  AlertTriangle,
  FileCheck2,
  HelpCircle,
  Eye,
  CheckCircle2,
  Info,
  Clock,
  Sparkles,
} from "lucide-react";
import { AccuracyReportData, AccuracyDimension } from "../types/analysis";
import { cn } from "@/utils/cn";

interface AccuracyReportProps {
  data: AccuracyReportData;
  onSeek: (seconds: number) => void;
}

export const AccuracyReport: React.FC<AccuracyReportProps> = ({ data, onSeek }) => {
  const getStatusBadge = (status: AccuracyDimension["status"]) => {
    switch (status) {
      case "Verified":
        return (
          <span className="inline-flex items-center gap-1 rounded bg-success/15 px-2 py-0.5 text-xs font-semibold text-success border border-success/30">
            <CheckCircle2 className="h-3 w-3" />
            Verified
          </span>
        );
      case "Partially Verified":
        return (
          <span className="inline-flex items-center gap-1 rounded bg-warning/15 px-2 py-0.5 text-xs font-semibold text-warning border border-warning/30">
            <AlertTriangle className="h-3 w-3" />
            Partially Verified
          </span>
        );
      case "Unclear":
        return (
          <span className="inline-flex items-center gap-1 rounded bg-error/15 px-2 py-0.5 text-xs font-semibold text-error border border-error/30">
            <HelpCircle className="h-3 w-3" />
            Unclear
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded bg-card px-2 py-0.5 text-xs font-semibold text-text-muted border border-card-border">
            Not Detectable
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Evidence & Rating Banner */}
      <div className="rounded-xl border border-card-border bg-card p-5 shadow-card space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-card-border/70 pb-3">
          <div className="flex items-center gap-2.5">
            <span className="p-2.5 rounded-lg bg-success/15 text-success border border-success/30">
              <ShieldCheck className="h-5 w-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-text-primary">
                  Evidence-Based Accuracy & Reliability Report
                </h3>
                <span className="rounded-full bg-success/15 px-2 py-0.5 text-[10px] font-semibold text-success border border-success/30 font-mono">
                  {data.overallScore}% Overall Score
                </span>
              </div>
              <p className="text-xs text-text-muted mt-0.5">
                Clear distinction between direct sensor evidence and model-assisted analytical inferences
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs text-text-muted">Verification Level:</span>
            <p className="text-sm font-bold text-success">{data.overallAccuracyRating}</p>
          </div>
        </div>

        <p className="text-xs text-text-secondary leading-relaxed">
          {data.methodologyNotes}
        </p>
      </div>

      {/* 6 Verification Dimensions */}
      <div className="rounded-xl border border-card-border bg-card p-5 shadow-card space-y-4">
        <h4 className="text-sm font-bold text-text-primary flex items-center gap-2">
          <FileCheck2 className="h-4 w-4 text-primary" />
          The 6 Core Verification Dimensions
        </h4>

        <div className="space-y-3">
          {data.dimensions.map((dim, idx) => (
            <div
              key={idx}
              className="rounded-xl border border-card-border bg-background-elevated/70 p-4 space-y-3 hover:border-primary/30 transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-card-border/60 pb-2.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-text-muted font-bold">
                    0{idx + 1}.
                  </span>
                  <h5 className="text-sm font-bold text-text-primary">
                    {dim.dimension}
                  </h5>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono font-bold text-primary">
                    {dim.confidenceScore}% Confidence
                  </span>
                  {getStatusBadge(dim.status)}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                {/* Direct Evidence */}
                <div className="rounded-lg bg-card p-3 border border-card-border space-y-1">
                  <span className="text-[10px] font-bold text-success uppercase tracking-wider flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    Direct Sensor Evidence
                  </span>
                  <p className="text-text-secondary leading-relaxed">
                    {dim.directEvidenceSummary}
                  </p>
                </div>

                {/* AI Interpretation */}
                <div className="rounded-lg bg-card p-3 border border-card-border space-y-1">
                  <span className="text-[10px] font-bold text-primary uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="h-3 w-3" />
                    AI Structural Interpretation
                  </span>
                  <p className="text-text-secondary leading-relaxed">
                    {dim.aiInterpretationSummary}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Unclear or Unverifiable Sections Log */}
      <div className="rounded-xl border border-warning/30 bg-warning/5 p-5 shadow-card space-y-4">
        <div className="flex items-center justify-between border-b border-warning/20 pb-3">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-warning/20 text-warning">
              <AlertTriangle className="h-4 w-4" />
            </span>
            <div>
              <h4 className="text-sm font-bold text-text-primary">
                Unclear or Ambiguous Sections Log ({data.unclearSections.length})
              </h4>
              <p className="text-xs text-text-muted">
                Transparent documentation of audio clipping, fast text motion, or occlusions
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {data.unclearSections.map((sec) => (
            <div
              key={sec.id}
              className="rounded-lg border border-warning/20 bg-background/80 p-3.5 space-y-2 text-xs"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5">
                <div className="flex items-center gap-2">
                  <span className="rounded bg-warning/15 px-2 py-0.5 text-[10px] font-bold text-warning uppercase">
                    {sec.category}
                  </span>
                  <span className="font-mono text-xs font-semibold text-text-primary">
                    {sec.timestamp}
                  </span>
                </div>
                <span className="text-[11px] text-text-muted">
                  Logged by Verification Engine
                </span>
              </div>

              <p className="font-medium text-text-primary">{sec.description}</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-1 border-t border-card-border/60">
                <p className="text-text-secondary">
                  <strong className="text-text-muted">Root Cause:</strong> {sec.reason}
                </p>
                <p className="text-text-secondary">
                  <strong className="text-text-muted">System Action:</strong>{" "}
                  {sec.recommendation}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
