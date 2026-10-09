import React from "react";
import { Dna, CheckCircle2 } from "lucide-react";
import { Card } from "@/components/cards";
import { SectionTitle } from "@/components/common";

export const CreatorProfile: React.FC = () => {
  return (
    <section id="creator-dna" className="py-20">
      <div className="mx-auto max-w-container px-4 sm:px-6 lg:px-8 space-y-12">
        <SectionTitle
          eyebrow="Creator DNA Profile"
          title="A living blueprint of your creative identity"
          subtitle="Every piece of content you approve makes your personal voice model sharper."
        />

        <Card className="p-6 sm:p-8 border-primary/40">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 items-center">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 rounded-sm bg-primary/15 px-3 py-1 text-xs font-semibold text-primary">
                <Dna className="h-4 w-4" />
                <span>Voice Calibration Breakdown</span>
              </div>
              <h3 className="text-2xl font-bold text-text-primary">
                92% Voice Fidelity Score
              </h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                Virulmuse tracks 14 distinct stylistic markers—including hook
                directness, storytelling cadence, vocabulary warmth, and CTA
                structure.
              </p>
              <ul className="space-y-2 text-sm text-text-primary">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-success" />
                  <span>Tone: Direct, Contrarian & Practical</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-success" />
                  <span>Sentence Rhythm: Short punchy openers + data proof</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-success" />
                  <span>Signature Vocabulary: "Framework", "Leverage", "Real talk"</span>
                </li>
              </ul>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Tone & Voice", score: "94%" },
                { label: "Hook Pattern", score: "91%" },
                { label: "Pacing & Structure", score: "89%" },
                { label: "Audience Resonance", score: "95%" },
              ].map((metric) => (
                <div
                  key={metric.label}
                  className="rounded-md border border-card-border bg-background p-4"
                >
                  <p className="text-xs text-text-secondary">{metric.label}</p>
                  <p className="mt-1 text-2xl font-extrabold text-primary">
                    {metric.score}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
};

export default CreatorProfile;
