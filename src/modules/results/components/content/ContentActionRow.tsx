import React, { useState } from "react";
import { Copy, Check } from "lucide-react";

export const ContentActionRow: React.FC<{ text: string }> = ({ text }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard?.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="flex items-center gap-3 pt-3 border-t border-card-border">
      <button
        type="button"
        onClick={handleCopy}
        className="inline-flex items-center gap-1.5 rounded-sm bg-primary/15 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/25"
      >
        {copied ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
        <span>{copied ? "Copied to Clipboard" : "Copy Content"}</span>
      </button>
    </div>
  );
};

export default ContentActionRow;
