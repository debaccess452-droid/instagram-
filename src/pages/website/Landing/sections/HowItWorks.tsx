import React from "react";
import { Card } from "@/components/cards";
import { SectionTitle } from "@/components/common";

const STEPS = [
  {
    step: "01",
    title: "Import Your Best Content",
    description:
      "Connect your Instagram or paste 3–5 of your favorite posts so Virulmuse can analyze your unique writing style.",
  },
  {
    step: "02",
    title: "Drop a Rough Idea or Topic",
    description:
      "Type a messy thought, bullet list, or lesson learned—no complex prompt engineering needed.",
  },
  {
    step: "03",
    title: "Publish High-Performing Posts",
    description:
      "Get scored hooks, Reel scripts, captions, threads, and CTAs ready to copy and post in seconds.",
  },
];

export const HowItWorks: React.FC = () => {
  return (
    <section id="how-it-works" className="py-20 bg-background-elevated/40 border-y border-card-border">
      <div className="mx-auto max-w-container px-4 sm:px-6 lg:px-8 space-y-12">
        <SectionTitle
          eyebrow="How It Works"
          title="Three numbered steps from raw idea to published content"
          subtitle="Zero prompt engineering. Just your voice, amplified."
        />

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {STEPS.map((item) => (
            <Card key={item.step} className="space-y-4 relative">
              <span className="inline-flex items-center justify-center rounded-sm bg-primary/15 px-3 py-1 text-xs font-extrabold text-primary border border-primary/30">
                STEP {item.step}
              </span>
              <h3 className="text-xl font-bold text-text-primary">{item.title}</h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                {item.description}
              </p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
