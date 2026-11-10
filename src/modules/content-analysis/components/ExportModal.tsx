import React, { useState } from "react";
import {
  Download,
  X,
  FileSpreadsheet,
  FileCode,
  Copy,
  Printer,
  Check,
  CheckCircle2,
} from "lucide-react";
import { ContentAnalysisResult } from "../types/analysis";
import { contentAnalysisService } from "../services/contentAnalysisService";
import { Button } from "@/components/buttons";

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: ContentAnalysisResult;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  result,
}) => {
  const [copiedMarkdown, setCopiedMarkdown] = useState(false);

  if (!isOpen) return null;

  const handleExportCSV = () => {
    contentAnalysisService.exportScriptTableToCSV(
      result.scriptTable,
      result.videoTitle
    );
  };

  const handleExportJSON = () => {
    contentAnalysisService.exportFullAnalysisJSON(result);
  };

  const handleCopyMarkdown = () => {
    const md = contentAnalysisService.formatTableAsMarkdown(result.scriptTable);
    navigator.clipboard.writeText(md);
    setCopiedMarkdown(true);
    setTimeout(() => setCopiedMarkdown(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-auth-fade-in">
      <div className="relative w-full max-w-lg rounded-2xl border border-card-border bg-gradient-to-b from-card to-background-elevated p-6 shadow-card-lg space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-card-border pb-3.5">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-lg bg-primary/15 text-primary border border-primary/25">
              <Download className="h-4 w-4" />
            </span>
            <div>
              <h3 className="text-base font-bold text-text-primary">
                Export Analysis Report
              </h3>
              <p className="text-xs text-text-muted">
                {result.videoTitle}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-md text-text-secondary hover:text-text-primary hover:bg-white/5 transition-colors"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Export Options Cards */}
        <div className="space-y-3 text-xs">
          {/* Option 1: CSV Table */}
          <div className="rounded-xl border border-card-border bg-card p-4 flex items-center justify-between hover:border-primary/40 transition-colors">
            <div className="flex items-center gap-3">
              <span className="p-2.5 rounded-lg bg-success/15 text-success border border-success/20">
                <FileSpreadsheet className="h-5 w-5" />
              </span>
              <div>
                <h4 className="font-semibold text-text-primary text-sm">
                  Original Reel Script Table (CSV)
                </h4>
                <p className="text-text-muted mt-0.5">
                  Synchronized 4-column timeline spreadsheet ready for Excel, Sheets, or Notion
                </p>
              </div>
            </div>

            <Button variant="secondary" size="sm" onClick={handleExportCSV}>
              Download
            </Button>
          </div>

          {/* Option 2: Full JSON Dataset */}
          <div className="rounded-xl border border-card-border bg-card p-4 flex items-center justify-between hover:border-primary/40 transition-colors">
            <div className="flex items-center gap-3">
              <span className="p-2.5 rounded-lg bg-trust/15 text-trust border border-trust/20">
                <FileCode className="h-5 w-5" />
              </span>
              <div>
                <h4 className="font-semibold text-text-primary text-sm">
                  Complete Multimodal JSON
                </h4>
                <p className="text-text-muted mt-0.5">
                  Raw telemetry covering audio, scenes, OCR bounding boxes, and accuracy metrics
                </p>
              </div>
            </div>

            <Button variant="secondary" size="sm" onClick={handleExportJSON}>
              Download
            </Button>
          </div>

          {/* Option 3: Copy Markdown */}
          <div className="rounded-xl border border-card-border bg-card p-4 flex items-center justify-between hover:border-primary/40 transition-colors">
            <div className="flex items-center gap-3">
              <span className="p-2.5 rounded-lg bg-primary/15 text-primary border border-primary/20">
                <Copy className="h-5 w-5" />
              </span>
              <div>
                <h4 className="font-semibold text-text-primary text-sm">
                  Copy Markdown Script Table
                </h4>
                <p className="text-text-muted mt-0.5">
                  Paste clean Markdown table into Obsidian, Docs, or Slack
                </p>
              </div>
            </div>

            <Button variant="secondary" size="sm" onClick={handleCopyMarkdown}>
              {copiedMarkdown ? (
                <span className="flex items-center gap-1 text-success">
                  <Check className="h-3.5 w-3.5" />
                  Copied
                </span>
              ) : (
                "Copy"
              )}
            </Button>
          </div>

          {/* Option 4: PDF / Print */}
          <div className="rounded-xl border border-card-border bg-card p-4 flex items-center justify-between hover:border-primary/40 transition-colors">
            <div className="flex items-center gap-3">
              <span className="p-2.5 rounded-lg bg-cta/15 text-cta border border-cta/20">
                <Printer className="h-5 w-5" />
              </span>
              <div>
                <h4 className="font-semibold text-text-primary text-sm">
                  Print or Save as PDF
                </h4>
                <p className="text-text-muted mt-0.5">
                  Generate formatted executive document for brand clients or agency stakeholders
                </p>
              </div>
            </div>

            <Button variant="secondary" size="sm" onClick={handlePrint}>
              Print
            </Button>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-2 text-center text-[11px] text-text-muted">
          All data generated with Virulmuse Multimodal Content Analysis
        </div>
      </div>
    </div>
  );
};
