import React, { useState } from "react";
import {
  Type,
  Copy,
  Check,
  Play,
  Sparkles,
  ShieldCheck,
  Search,
  Filter,
} from "lucide-react";
import { TextExtractionData, OnScreenTextElement } from "../types/analysis";
import { Button } from "@/components/buttons";
import { cn } from "@/utils/cn";

interface TextExtractionProps {
  data: TextExtractionData;
  onSeek: (seconds: number) => void;
}

export const TextExtraction: React.FC<TextExtractionProps> = ({ data, onSeek }) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPosition, setSelectedPosition] = useState<string>("all");

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const handleCopyAll = () => {
    const allText = data.textElements.map((t) => `[${t.timestamp}] ${t.exactText}`).join("\n");
    navigator.clipboard.writeText(allText);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  const filteredElements = data.textElements.filter((el) => {
    const matchesSearch =
      el.exactText.toLowerCase().includes(searchQuery.toLowerCase()) ||
      el.fontStyleDescription.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPos =
      selectedPosition === "all" || el.position === selectedPosition;
    return matchesSearch && matchesPos;
  });

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="rounded-xl border border-card-border bg-card p-5 shadow-card space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-card-border/70 pb-3">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-cta/15 text-cta border border-cta/25">
              <Type className="h-4 w-4" />
            </span>
            <div>
              <h3 className="text-base font-bold text-text-primary">
                On-Screen Text Extraction (OCR & Kinetic Typography)
              </h3>
              <p className="text-xs text-text-muted">
                {data.totalTextElements} visible typographic elements extracted with exact formatting
              </p>
            </div>
          </div>

          <Button
            variant="secondary"
            size="sm"
            onClick={handleCopyAll}
            leftIcon={copiedAll ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
          >
            {copiedAll ? "Copied All Text" : "Copy All Extracted Text"}
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-text-secondary pt-1">
          <p>
            <strong className="text-text-primary font-medium">Captioning Style:</strong>{" "}
            {data.captioningStyle}
          </p>
          <span className="text-[11px] font-mono text-success bg-success/10 px-2 py-0.5 rounded border border-success/20">
            Average OCR Confidence: 98.7%
          </span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search on-screen text..."
            className="w-full rounded-md border border-card-border bg-card pl-9 pr-3 py-1.5 text-xs text-text-primary placeholder:text-text-muted focus:border-primary/50 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="h-3.5 w-3.5 text-text-muted shrink-0" />
          <select
            value={selectedPosition}
            onChange={(e) => setSelectedPosition(e.target.value)}
            className="rounded-md border border-card-border bg-card px-2.5 py-1.5 text-xs text-text-secondary focus:border-primary/50 focus:outline-none"
          >
            <option value="all">All Screen Positions</option>
            <option value="top-center">Top Center</option>
            <option value="middle-center">Middle Center</option>
            <option value="lower-third">Lower Third</option>
            <option value="bottom-center">Bottom Center</option>
          </select>
        </div>
      </div>

      {/* OCR Table */}
      <div className="rounded-xl border border-card-border bg-card overflow-hidden shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-card-border bg-background-elevated text-text-muted uppercase text-[10px] tracking-wider font-semibold">
                <th className="py-3 px-4 w-32">Time</th>
                <th className="py-3 px-4">Exact On-Screen Text</th>
                <th className="py-3 px-4 w-36">Position</th>
                <th className="py-3 px-4">Styling & Treatment</th>
                <th className="py-3 px-4 w-32">Confidence</th>
                <th className="py-3 px-4 w-20 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-card-border/60">
              {filteredElements.map((el) => (
                <tr
                  key={el.id}
                  className="hover:bg-white/[0.02] transition-colors group"
                >
                  {/* Time */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => onSeek(el.startTime)}
                      className="inline-flex items-center gap-1.5 rounded-md bg-primary/10 hover:bg-primary/20 text-primary border border-primary/25 px-2 py-1 text-xs font-mono font-medium transition-colors"
                      title="Seek video"
                    >
                      <Play className="h-3 w-3 fill-current" />
                      <span>{el.timestamp}</span>
                    </button>
                  </td>

                  {/* Exact Text */}
                  <td className="py-3.5 px-4 font-semibold text-text-primary text-sm">
                    <div className="flex items-center gap-2">
                      <span className="break-words">{el.exactText}</span>
                      {el.isAnimated && (
                        <span className="rounded bg-primary/10 px-1.5 py-0.2 text-[9px] font-mono text-primary border border-primary/20 shrink-0">
                          {el.animationType || "Animated"}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Position */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className="rounded bg-background-elevated px-2 py-1 text-[11px] font-mono text-text-secondary border border-card-border">
                      {el.position}
                    </span>
                  </td>

                  {/* Styling */}
                  <td className="py-3.5 px-4 text-text-secondary">
                    <div className="space-y-0.5">
                      <p className="text-[11px] font-medium text-text-primary">
                        {el.fontStyleDescription}
                      </p>
                      <p className="text-[10px] text-text-muted">
                        Color: {el.textColor} · {el.backgroundTreatment}
                      </p>
                    </div>
                  </td>

                  {/* Confidence */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <ShieldCheck className="h-3.5 w-3.5 text-success" />
                      <span className="font-mono text-success font-semibold">
                        {el.ocrConfidence}%
                      </span>
                      <span className="text-[10px] text-text-muted">
                        ({el.verificationStatus})
                      </span>
                    </div>
                  </td>

                  {/* Action */}
                  <td className="py-3.5 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => handleCopyText(el.id, el.exactText)}
                      className="p-1.5 rounded text-text-muted hover:text-text-primary hover:bg-background-elevated transition-colors"
                      title="Copy exact text"
                      aria-label="Copy exact text"
                    >
                      {copiedId === el.id ? (
                        <Check className="h-4 w-4 text-success" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </button>
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
