import React, { useState } from "react";
import {
  FileSpreadsheet,
  Copy,
  Check,
  Download,
  Play,
  Search,
  CheckCircle2,
} from "lucide-react";
import { ScriptTableRow } from "../types/analysis";
import { contentAnalysisService } from "../services/contentAnalysisService";
import { Button } from "@/components/buttons";

export interface OriginalScriptTableProps {
  scriptTable: ScriptTableRow[];
  videoTitle: string;
  onSeek: (seconds: number) => void;
  onOpenExport?: () => void;
  isDemoData?: boolean;
}

export const OriginalScriptTable: React.FC<OriginalScriptTableProps> = ({
  scriptTable,
  videoTitle,
  onSeek,
  isDemoData = false,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedTable, setCopiedTable] = useState(false);
  const [copiedRowId, setCopiedRowId] = useState<string | null>(null);

  const handleCopyTable = () => {
    const markdown = contentAnalysisService.formatTableAsMarkdown(scriptTable);
    navigator.clipboard.writeText(markdown);
    setCopiedTable(true);
    setTimeout(() => setCopiedTable(false), 2000);
  };

  const handleExportCSV = () => {
    contentAnalysisService.exportScriptTableToCSV(scriptTable, videoTitle);
  };

  const handleCopyRow = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedRowId(id);
    setTimeout(() => setCopiedRowId(null), 1800);
  };

  const filteredRows = (scriptTable || []).filter((row) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      (row.originalVoiceover && row.originalVoiceover.toLowerCase().includes(q)) ||
      (row.exactOnScreenText && row.exactOnScreenText.toLowerCase().includes(q)) ||
      (row.detailedVisualDirection &&
        row.detailedVisualDirection.toLowerCase().includes(q)) ||
      (row.timestamp && row.timestamp.includes(q))
    );
  });

  return (
    <div className="space-y-6">
      {/* Demo Mode / Evidence Notice */}
      {isDemoData && (
        <div className="flex items-center justify-between rounded-xl bg-primary/5 border border-primary/20 px-4 py-2.5 text-xs shadow-sm">
          <div className="flex items-center gap-2.5 text-text-secondary">
            <span className="inline-block h-2 w-2 rounded-full bg-primary animate-pulse" />
            <span className="font-semibold text-text-primary">Demo Analysis Mode</span>
            <span className="hidden sm:inline text-text-muted">
              — Displaying benchmark Reel multimodal synchronized master script
            </span>
          </div>
          <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-primary/15 text-primary border border-primary/25 font-semibold">
            Reference Sample
          </span>
        </div>
      )}

      {/* Header & Master Blueprint Toolbar */}
      <div className="rounded-xl border border-primary/25 bg-gradient-to-r from-card via-background-elevated to-card p-5 shadow-card space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-card-border/70 pb-3.5">
          <div className="flex items-center gap-2.5">
            <span className="p-2.5 rounded-lg bg-primary/20 text-primary border border-primary/30 shadow-glow-primary">
              <FileSpreadsheet className="h-5 w-5" />
            </span>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-bold text-text-primary">
                  Original Reel Script
                </h3>
                <span className="rounded-full bg-primary/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary border border-primary/30">
                  CORE MASTER BLUEPRINT
                </span>
              </div>
              <p className="text-xs text-text-muted mt-0.5">
                Exact multimodal synchronization of voiceover, on-screen text and visual staging.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap self-end sm:self-center">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleCopyTable}
              leftIcon={
                copiedTable ? (
                  <Check className="h-3.5 w-3.5 text-success" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )
              }
            >
              {copiedTable ? "Copied Table" : "Copy Table"}
            </Button>

            <Button
              variant="primary"
              size="sm"
              onClick={handleExportCSV}
              leftIcon={<Download className="h-3.5 w-3.5" />}
            >
              Export CSV
            </Button>
          </div>
        </div>

        {/* Useful Status Indicators & Row Count */}
        <div className="flex items-center justify-between text-xs text-text-secondary pt-0.5 flex-wrap gap-2.5">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="inline-flex items-center gap-1 rounded bg-success/15 px-2 py-0.5 text-[10px] font-medium text-success border border-success/20">
              <CheckCircle2 className="h-3 w-3" />
              Audio synchronized
            </span>
            <span className="inline-flex items-center gap-1 rounded bg-success/15 px-2 py-0.5 text-[10px] font-medium text-success border border-success/20">
              <CheckCircle2 className="h-3 w-3" />
              Visual analysis available
            </span>
            <span className="inline-flex items-center gap-1 rounded bg-success/15 px-2 py-0.5 text-[10px] font-medium text-success border border-success/20">
              <CheckCircle2 className="h-3 w-3" />
              OCR extraction available
            </span>
          </div>

          <span className="font-mono text-[11px] text-text-muted">
            {filteredRows.length} synchronized intervals
          </span>
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search voiceover, text, or visual action..."
            className="w-full rounded-lg border border-card-border bg-card pl-9 pr-3 py-1.5 text-xs text-text-primary placeholder:text-text-muted focus:border-primary/50 focus:outline-none transition-colors"
          />
        </div>

        <p className="hidden sm:block text-xs text-text-muted">
          Click any timestamp to seek video player
        </p>
      </div>

      {/* Main 4-Column Script Table */}
      <div className="rounded-xl border border-card-border bg-card overflow-hidden shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[760px] text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-card-border bg-background-elevated text-text-muted uppercase text-[10px] tracking-wider font-semibold">
                <th scope="col" className="py-3 px-4 w-32 sm:w-36">
                  Time
                </th>
                <th scope="col" className="py-3 px-4 w-[30%]">
                  Original Voiceover / Audio
                </th>
                <th scope="col" className="py-3 px-4 w-[28%]">
                  Exact On-Screen Text
                </th>
                <th scope="col" className="py-3 px-4 w-[34%]">
                  Visual Direction
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-card-border/60">
              {filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-10 text-center text-text-muted text-xs">
                    {searchQuery
                      ? `No script intervals matching "${searchQuery}".`
                      : "No script data available."}
                  </td>
                </tr>
              ) : (
                filteredRows.map((row) => (
                  <tr
                    key={row.id}
                    className="hover:bg-background-elevated/60 transition-colors group"
                  >
                    {/* Column 1: Time */}
                    <td className="py-3.5 px-4 align-top whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => onSeek(row.startTime)}
                        className="inline-flex items-center gap-1.5 rounded bg-primary/10 hover:bg-primary/20 text-primary border border-primary/25 px-2 py-1 font-mono text-xs font-semibold transition-colors group-hover:border-primary/50"
                        title="Click to seek video player"
                      >
                        <Play className="h-3 w-3 fill-current" />
                        <span>{row.timestamp}</span>
                      </button>
                    </td>

                    {/* Column 2: Original Voiceover / Audio */}
                    <td className="py-3.5 px-4 align-top leading-relaxed text-text-primary">
                      <div className="flex items-start justify-between gap-2 rounded-lg bg-background-elevated/40 p-2.5 border border-card-border/50">
                        <span className="font-medium">
                          {row.originalVoiceover ? `"${row.originalVoiceover}"` : "—"}
                        </span>
                        {row.originalVoiceover && (
                          <button
                            type="button"
                            onClick={() =>
                              handleCopyRow(`${row.id}-vo`, row.originalVoiceover)
                            }
                            className="p-1 rounded text-text-muted hover:text-text-primary hover:bg-background-elevated transition-colors shrink-0"
                            title="Copy voiceover"
                            aria-label="Copy voiceover"
                          >
                            {copiedRowId === `${row.id}-vo` ? (
                              <Check className="h-3.5 w-3.5 text-success" />
                            ) : (
                              <Copy className="h-3.5 w-3.5 opacity-40 group-hover:opacity-100" />
                            )}
                          </button>
                        )}
                      </div>
                    </td>

                    {/* Column 3: Exact On-Screen Text */}
                    <td className="py-3.5 px-4 align-top leading-relaxed">
                      {row.exactOnScreenText &&
                      row.exactOnScreenText.trim().length > 0 &&
                      !row.exactOnScreenText
                        .toLowerCase()
                        .includes("no on-screen text") ? (
                        <div className="flex items-start justify-between gap-2 rounded-lg bg-cta/5 p-2.5 border border-cta/20 text-cta font-mono font-semibold text-xs">
                          <span className="break-words">{row.exactOnScreenText}</span>
                          <button
                            type="button"
                            onClick={() =>
                              handleCopyRow(`${row.id}-txt`, row.exactOnScreenText)
                            }
                            className="p-1 rounded text-text-muted hover:text-text-primary hover:bg-background-elevated transition-colors shrink-0"
                            title="Copy on-screen text"
                            aria-label="Copy on-screen text"
                          >
                            {copiedRowId === `${row.id}-txt` ? (
                              <Check className="h-3.5 w-3.5 text-success" />
                            ) : (
                              <Copy className="h-3.5 w-3.5 opacity-40 group-hover:opacity-100" />
                            )}
                          </button>
                        </div>
                      ) : (
                        <span className="text-text-muted italic text-xs px-1">
                          No on-screen text detected.
                        </span>
                      )}
                    </td>

                    {/* Column 4: Visual Direction */}
                    <td className="py-3.5 px-4 align-top text-text-secondary leading-relaxed">
                      <p className="text-xs font-normal">
                        {row.detailedVisualDirection ||
                          "No significant visual change detected."}
                      </p>
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
};

export default OriginalScriptTable;
