import React from "react";
import { AlertCircle } from "lucide-react";
import { Card } from "@/components/cards";
import { SectionTitle } from "@/components/common";

const PROBLEMS = [
  {
    title: "Generic AI sounds robotic",
    description:
      "Standard prompts produce stiff corporate clichés and overused hooks that your followers immediately scroll past.",
  },
  {
    title: "Blank-page fatigue",
    description:
      "Staring at a blinking cursor every morning drains the creative energy you need to actually run your business.",
  },
  {
    title: "Cross-platform burnout",
    description:
      "Manually rewriting a single insight for Instagram Reels, X threads, and LinkedIn takes hours of tedious editing.",
  },
];

export const Problem: React.FC = () => {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-container px-4 sm:px-6 lg:px-8 space-y-12">
        <SectionTitle
          eyebrow="The Creator Bottleneck"
          title="Why 90% of AI-generated posts fail to convert"
          subtitle="Your audience follows you for your voice, stories, and perspective—not generic templates."
        />

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {PROBLEMS.map((item) => (
            <Card key={item.title} className="space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-error/15 text-error">
                <AlertCircle className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-text-primary">{item.title}</h3>
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

export default Problem;
