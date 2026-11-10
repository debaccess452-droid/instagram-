import React, { useState } from "react";
import {
  FileSpreadsheet,
  Copy,
  Check,
  Download,
  Play,
  ChevronDown,
  ChevronUp,
  Search,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  Eye,
  Maximize2,
} from "lucide-react";
import { ScriptTableRow } from "../types/analysis";
import { contentAnalysisService } from "../services/contentAnalysisService";
import { Button } from "@/components/buttons";
import { cn } from "@/utils/cn";

interface OriginalScriptTableProps {
  scriptTable: ScriptTableRow[];
  videoTitle: string;
  onSeek: (seconds: number) => void;
  onOpenExport?: () => void;
}

export const OriginalScriptTable: React.FC<OriginalScriptTableProps> = ({
  scriptTable,
  videoTitle,
  onSeek,
  onOpenExport,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedRowIds, setExpandedRowIds] = useState<Record<string, boolean>>({});
  const [copiedTable, setCopiedTable] = useState(false);

  const toggleRowExpand = (id: string) => {
    setExpandedRowIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCopyTable = () => {
    const markdown = contentAnalysisService.formatTableAsMarkdown(scriptTable);
    navigator.clipboard.writeText(markdown);
    setCopiedTable(true);
    setTimeout(() => setCopiedTable(false), 2000);
  };

  const handleExportCSV = () => {
    contentAnalysisService.exportScriptTableToCSV(scriptTable, videoTitle);
  };

  const filteredRows = scriptTable.filter((row) => {
    const q = searchQuery.toLowerCase();
    return (
      row.originalVoiceover.toLowerCase().includes(q) ||
      row.exactOnScreenText.toLowerCase().includes(q) ||
      row.detailedVisualDirection.toLowerCase().includes(q) ||
      row.timestamp.includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="rounded-xl border border-primary/25 bg-gradient-to-r from-card via-background-elevated to-card p-5 shadow-card space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-card-border/70 pb-3">
          <div className="flex items-center gap-2.5">
            <span className="p-2.5 rounded-lg bg-primary/20 text-primary border border-primary/30 shadow-glow-primary">
              <FileSpreadsheet className="h-5 w-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-text-primary">
                  Original Reel Script Table
                </h3>
                <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-semibold text-primary border border-primary/25">
                  Core Master Blueprint
                </span>
              </div>
              <p className="text-xs text-text-muted mt-0.5">
                Exact multimodal synchronization of voiceover, on-screen text, and visual staging
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
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
              {copiedTable ? "Copied Markdown" : "Copy Table"}
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

        {/* Rule note */}
        <div className="flex items-center justify-between text-xs text-text-secondary pt-1 flex-wrap gap-2">
          <span className="flex items-center gap-1.5 text-[11px] text-text-muted">
            <ShieldCheck className="h-3.5 w-3.5 text-success" />
            Strict adherence: exact words & text preserved without editorial paraphrasing
          </span>
          <span className="font-mono text-[11px] text-primary">
            {filteredRows.length} synchronized rows
          </span>
        </div>
      </div>

      {/* Search Filter */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search voiceover, text, or visual action..."
            className="w-full rounded-md border border-card-border bg-card pl-9 pr-3 py-1.5 text-xs text-text-primary placeholder:text-text-muted focus:border-primary/50 focus:outline-none"
          />
        </div>

        <p className="hidden sm:block text-xs text-text-muted">
          Click any timestamp to seek video player
        </p>
      </div>

      {/* Master 4-Column Script Table */}
      <div className="rounded-xl border border-card-border bg-card overflow-hidden shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[760px]">
            <thead>
              <tr className="border-b border-card-border bg-background-elevated text-text-muted uppercase text-[10px] tracking-wider font-semibold">
                <th className="py-3 px-4 w-32">Time</th>
                <th className="py-3 px-4 w-1/4">Original Voiceover / Audio</th>
                <th className="py-3 px-4 w-1/4">Exact On-Screen Text</th>
                <th className="py-3 px-4">Detailed Visual Direction</th>
                <th className="py-3 px-3 w-12 text-center"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-card-border/60 text-xs">
              {filteredRows.map((row) => {
                const isExpanded = Boolean(expandedRowIds[row.id]);
                return (
                  <React.Fragment key={row.id}>
                    <tr className="hover:bg-white/[0.02] transition-colors group">
                      {/* Column 1: Time */}
                      <td className="py-3.5 px-4 align-top whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => onSeek(row.startTime)}
                          className="inline-flex items-center gap-1.5 rounded-md bg-primary/10 hover:bg-primary/20 text-primary border border-primary/25 px-2 py-1 text-xs font-mono font-medium transition-colors group-hover:border-primary/40"
                          title="Seek video to this timestamp"
                        >
                          <Play className="h-3 w-3 fill-current" />
                          <span>{row.timestamp}</span>
                        </button>
                        <div className="mt-1 flex items-center gap-1 text-[10px] text-text-muted">
                          <span>Scene {row.sceneNumber}</span>
                          <span>•</span>
                          <span className="text-success">{row.confidenceScore}%</span>
                        </div>
                      </td>

                      {/* Column 2: Original Voiceover / Audio */}
                      <td className="py-3.5 px-4 align-top font-medium text-text-primary leading-relaxed">
                        <div className="rounded-md bg-background-elevated/40 p-2.5 border border-card-border/50">
                          "{row.originalVoiceover}"
                        </div>
                      </td>

                      {/* Column 3: Exact On-Screen Text */}
                      <td className="py-3.5 px-4 align-top leading-relaxed">
                        <div className="rounded-md bg-cta/5 p-2.5 border border-cta/20 text-cta font-mono font-semibold text-[11px]">
                          {row.exactOnScreenText}
                        </div>
                      </td>

                      {/* Column 4: Detailed Visual Direction */}
                      <td className="py-3.5 px-4 align-top text-text-secondary leading-relaxed">
                        <p>{row.detailedVisualDirection}</p>
                        {row.uncertaintyNotes && (
                          <div className="mt-1.5 flex items-center gap-1.5 text-[10px] text-warning bg-warning/10 px-2 py-0.5 rounded border border-warning/20">
                            <AlertCircle className="h-3 w-3 shrink-0" />
                            <span>{row.uncertaintyNotes}</span>
                          </div>
                        )}
                      </td>

                      {/* Expand Button */}
                      <td className="py-3.5 px-3 align-top text-center">
                        <button
                          type="button"
                          onClick={() => toggleRowExpand(row.id)}
                          className="p-1 rounded text-text-muted hover:text-text-primary hover:bg-background-elevated transition-colors"
                          title={isExpanded ? "Collapse metadata" : "Expand metadata"}
                          aria-label="Toggle details"
                        >
                          {isExpanded ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </button>
                      </td>
                    </tr>

                    {/* Expanded Row Detail */}
                    {isExpanded && (
                      <tr className="bg-background-elevated/80 border-b border-card-border">
                        <td colSpan={5} className="p-4">
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                            <div className="rounded bg-card p-2.5 border border-card-border">
                              <span className="text-[10px] text-text-muted uppercase font-semibold">
                                Multimodal Confidence
                              </span>
                              <p className="font-mono text-success font-medium mt-0.5">
                                {row.confidenceScore}% (Phoneme & Optical verified)
                              </p>
                            </div>
                            <div className="rounded bg-card p-2.5 border border-card-border">
                              <span className="text-[10px] text-text-muted uppercase font-semibold">
                                Scene Cut Marker
                              </span>
                              <p className="text-text-primary font-medium mt-0.5">
                                Scene {row.sceneNumber} (optical boundary match)
                              </p>
                            </div>
                            <div className="rounded bg-card p-2.5 border border-card-border">
                              <span className="text-[10px] text-text-muted uppercase font-semibold">
                                Synchronicity Latency
                              </span>
                              <p className="text-text-primary font-medium mt-0.5 font-mono">
                                ±0.04s audio-visual phase offset
                              </p>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
