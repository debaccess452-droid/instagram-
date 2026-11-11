import React, { useState } from "react";
import {
  Type,
  Copy,
  Check,
  Play,
  Search,
  CheckCircle2,
} from "lucide-react";
import { TextExtractionData, OnScreenTextElement } from "../types/analysis";
import { Button } from "@/components/buttons";

export interface TextExtractionProps {
  data: TextExtractionData;
  onSeek: (seconds: number) => void;
  isDemoData?: boolean;
}

interface RelevantTextMeta {
  position?: string;
  style?: string;
  color?: string;
  animation?: string;
}

/**
 * Extracts visible styling and positioning ONLY when relevant to understanding the text.
 * Strictly adheres to rule: never invent font families, numerical sizes, or unobservable effects.
 */
function getRelevantMetadata(el: OnScreenTextElement): RelevantTextMeta | null {
  const meta: RelevantTextMeta = {};

  // 1. Position: Show only when non-standard or meaningful for spatial context
  if (el.position && el.position !== "middle-center") {
    meta.position = el.position
      .replace(/-/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
  }

  // 2. Visible Style: Cleanly identify visible bold, italic, uppercase, or outline without font family names
  if (el.fontStyleDescription) {
    const desc = el.fontStyleDescription;
    const styles: string[] = [];
    if (/bold|heavy|extrabold/i.test(desc)) styles.push("Bold");
    if (/italic/i.test(desc)) styles.push("Italic");
    if (/uppercase|all-caps/i.test(desc)) styles.push("Uppercase");
    if (/monospace/i.test(desc)) styles.push("Monospace");
    if (/handwritten/i.test(desc)) styles.push("Handwritten");
    if (/outlined/i.test(desc)) styles.push("Outlined");
    if (styles.length > 0) {
      meta.style = styles.join(", ");
    }
  }

  // 3. Color: Only when visually distinctive or useful for emphasis
  if (el.textColor) {
    const rawColor = el.textColor;
    const matchNamed = rawColor.match(/\(([^)]+)\)/);
    if (matchNamed && matchNamed[1]) {
      meta.color = matchNamed[1];
    } else if (rawColor.toLowerCase().includes("violet") || rawColor.toLowerCase().includes("purple")) {
      meta.color = "Violet accent";
    } else if (rawColor.toLowerCase().includes("red")) {
      meta.color = "Red accent";
    } else if (rawColor.toLowerCase().includes("orange")) {
      meta.color = "Orange CTA";
    } else if (rawColor.toLowerCase().includes("amber") || rawColor.toLowerCase().includes("gold")) {
      meta.color = "Amber";
    } else if (rawColor.toLowerCase().includes("green")) {
      meta.color = "Green";
    } else if (rawColor.toLowerCase().includes("cyan") || rawColor.toLowerCase().includes("blue")) {
      meta.color = "Blue";
    }
  }

  // 4. Animation: Only when text visibly moves, appears, or changes
  if (el.isAnimated && el.animationType) {
    meta.animation = el.animationType
      .replace(/\([^)]+\)/g, "")
      .replace(/elastic|spring|motion blur/gi, "")
      .trim();
  }

  if (!meta.position && !meta.style && !meta.color && !meta.animation) {
    return null;
  }

  return meta;
}

export const TextExtraction: React.FC<TextExtractionProps> = ({
  data,
  onSeek,
  isDemoData = false,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const elements = data?.textElements || [];

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const handleCopyAll = () => {
    const allText = elements
      .map((t) => `[${t.timestamp}] ${t.exactText}`)
      .join("\n");
    navigator.clipboard.writeText(allText);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  const filteredElements = elements.filter((el) =>
    el.exactText.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Demo Mode / Evidence Notice */}
      {isDemoData && (
        <div className="flex items-center justify-between rounded-xl bg-primary/5 border border-primary/20 px-4 py-2.5 text-xs shadow-sm">
          <div className="flex items-center gap-2.5 text-text-secondary">
            <span className="inline-block h-2 w-2 rounded-full bg-primary animate-pulse" />
            <span className="font-semibold text-text-primary">Demo Analysis Mode</span>
            <span className="hidden sm:inline text-text-muted">
              — Displaying benchmark Reel on-screen visual OCR text
            </span>
          </div>
          <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-primary/15 text-primary border border-primary/25 font-semibold">
            Reference Sample
          </span>
        </div>
      )}

      {/* Main Container Card */}
      <div className="rounded-xl border border-card-border bg-card p-5 space-y-4 shadow-card">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-card-border/80 pb-3">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-lg bg-primary/15 text-primary border border-primary/25">
              <Type className="h-4 w-4" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-text-primary">
                  On-Screen Text Extraction
                </h3>
                <span className="inline-flex items-center gap-1 rounded bg-success/15 px-2 py-0.2 text-[10px] font-semibold text-success border border-success/20">
                  <CheckCircle2 className="h-3 w-3" />
                  Visual OCR
                </span>
              </div>
              <p className="text-xs text-text-muted mt-0.5">
                Exact text visibly displayed within video frames with timestamps.
              </p>
            </div>
          </div>

          {elements.length > 0 && (
            <div className="flex items-center gap-2.5 self-end sm:self-center">
              <Button
                variant="secondary"
                size="sm"
                onClick={handleCopyAll}
                leftIcon={
                  copiedAll ? (
                    <Check className="h-3.5 w-3.5 text-success" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )
                }
              >
                {copiedAll ? "Copied All Text" : "Copy All Extracted Text"}
              </Button>
            </div>
          )}
        </div>

        {/* Search Bar (Only shown if elements exist) */}
        {elements.length > 0 && (
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search extracted text..."
              className="w-full rounded-lg border border-card-border bg-background-elevated/70 pl-9 pr-3 py-1.5 text-xs text-text-primary placeholder:text-text-muted focus:border-primary/50 focus:outline-none transition-colors"
            />
          </div>
        )}

        {/* Main Output: Clean Two-Column Table */}
        {elements.length === 0 ? (
          <div className="py-12 text-center space-y-1">
            <p className="text-sm font-semibold text-text-primary">
              No on-screen text detected.
            </p>
            <p className="text-xs text-text-muted">
              No visible captions, text overlays, or typography appeared in this video.
            </p>
          </div>
        ) : filteredElements.length === 0 ? (
          <div className="py-8 text-center text-xs text-text-muted">
            No on-screen text matching "{searchQuery}".
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-card-border">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-background-elevated border-b border-card-border text-[11px] uppercase tracking-wider text-text-muted font-semibold">
                <tr>
                  <th scope="col" className="w-36 sm:w-44 px-4 py-3">
                    Time
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Exact Extracted Text
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-card-border/60 bg-card">
                {filteredElements.map((el) => {
                  const meta = getRelevantMetadata(el);
                  return (
                    <tr
                      key={el.id}
                      className="hover:bg-background-elevated/60 transition-colors group"
                    >
                      {/* Column 1: Time */}
                      <td className="px-4 py-3 align-top whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => onSeek(el.startTime)}
                          className="inline-flex items-center gap-1.5 rounded bg-primary/10 hover:bg-primary/20 text-primary border border-primary/25 px-2 py-1 font-mono text-xs font-semibold transition-colors group-hover:border-primary/50"
                          title="Seek video to text appearance"
                        >
                          <Play className="h-3 w-3 fill-current" />
                          <span>{el.timestamp}</span>
                        </button>
                      </td>

                      {/* Column 2: Exact Extracted Text */}
                      <td className="px-4 py-3 align-top">
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1.5">
                            {/* Exact Text preserving original casing, punctuation, symbols */}
                            <p className="text-text-primary font-medium leading-relaxed sm:text-base">
                              {el.exactText}
                            </p>

                            {/* Relevant styling & positioning details (ONLY when relevant) */}
                            {meta && (
                              <div className="flex items-center gap-1.5 flex-wrap text-[11px] text-text-muted pt-0.5">
                                {meta.position && (
                                  <span className="rounded bg-background-elevated px-2 py-0.5 font-mono text-text-secondary border border-card-border">
                                    {meta.position}
                                  </span>
                                )}
                                {meta.style && (
                                  <span className="rounded bg-background-elevated px-2 py-0.5 text-text-secondary border border-card-border">
                                    {meta.style}
                                  </span>
                                )}
                                {meta.color && (
                                  <span className="rounded bg-background-elevated px-2 py-0.5 text-text-secondary border border-card-border">
                                    {meta.color}
                                  </span>
                                )}
                                {meta.animation && (
                                  <span className="rounded bg-primary/10 px-2 py-0.5 text-primary border border-primary/25 font-mono text-[10px]">
                                    {meta.animation}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Quick copy row action */}
                          <button
                            type="button"
                            onClick={() => handleCopyText(el.id, el.exactText)}
                            className="p-1.5 rounded text-text-muted hover:text-text-primary hover:bg-background-elevated transition-colors shrink-0"
                            title="Copy exact text"
                            aria-label="Copy exact text"
                          >
                            {copiedId === el.id ? (
                              <Check className="h-4 w-4 text-success" />
                            ) : (
                              <Copy className="h-4 w-4 opacity-60 group-hover:opacity-100" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default TextExtraction;
