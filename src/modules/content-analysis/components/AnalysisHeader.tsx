import React from "react";
import {
  Sparkles,
  History,
  Download,
  UploadCloud,
  FileSpreadsheet,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/buttons";

interface AnalysisHeaderProps {
  hasResult: boolean;
  isDemoData?: boolean;
  onOpenHistory: () => void;
  onOpenExport: () => void;
  onUploadNew: () => void;
  historyCount: number;
}

export const AnalysisHeader: React.FC<AnalysisHeaderProps> = ({
  hasResult,
  isDemoData,
  onOpenHistory,
  onOpenExport,
  onUploadNew,
  historyCount,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold text-primary border border-primary/30 shadow-sm">
              <Sparkles className="h-3.5 w-3.5 text-primary animate-pulse" />
              AI Video Intelligence
            </span>
            {hasResult && isDemoData && (
              <span className="inline-flex items-center gap-1 rounded-full bg-warning/10 px-2.5 py-0.5 text-[11px] font-medium text-warning border border-warning/20">
                <AlertCircle className="h-3 w-3" />
                Demo Analysis Mode
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-text-primary">
            Content Analysis
          </h1>
          <p className="mt-1 text-sm text-text-secondary max-w-2xl">
            Understand every second of your content with AI-powered audio, visual,
            transcription, and editing intelligence.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Button
            variant="secondary"
            size="sm"
            onClick={onOpenHistory}
            leftIcon={<History className="h-4 w-4 text-text-secondary" />}
          >
            History
            {historyCount > 0 && (
              <span className="ml-1 rounded-full bg-white/10 px-1.5 py-0.2 text-[10px] text-text-primary">
                {historyCount}
              </span>
            )}
          </Button>

          {hasResult && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={onUploadNew}
                leftIcon={<UploadCloud className="h-4 w-4 text-primary" />}
              >
                Analyze Another
              </Button>

              <Button
                variant="primary"
                size="sm"
                onClick={onOpenExport}
                leftIcon={<Download className="h-4 w-4" />}
              >
                Export Report
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
