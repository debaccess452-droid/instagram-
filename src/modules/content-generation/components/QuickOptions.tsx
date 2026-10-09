import React from "react";

const PROMPTS = [
  "Why most creators burn out after 30 days of daily posting",
  "3 counter-intuitive lessons from scaling my newsletter to 25K",
  "How to write a 3-second Instagram Reel hook that holds 80% retention",
];

export const QuickOptions: React.FC<{ onPick: (idea: string) => void }> = ({ onPick }) => (
  <div className="space-y-1.5">
    <p className="text-xs font-medium text-text-secondary">Or test with a sample creator prompt:</p>
    <div className="flex flex-wrap gap-2">
      {PROMPTS.map((p) => (
        <button
          key={p}
          type="button"
          onClick={() => onPick(p)}
          className="rounded-sm border border-card-border bg-background px-2.5 py-1 text-xs text-text-secondary hover:border-primary/40 hover:text-text-primary"
        >
          "{p}"
        </button>
      ))}
    </div>
  </div>
);

export default QuickOptions;
