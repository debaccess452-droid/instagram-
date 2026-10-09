import React from "react";
import { Sparkles, CheckCircle2 } from "lucide-react";
import { Card } from "@/components/cards";
import { SectionTitle } from "@/components/common";

export const Solution: React.FC = () => {
  return (
    <section className="py-20 bg-background-elevated/40 border-y border-card-border">
      <div className="mx-auto max-w-container px-4 sm:px-6 lg:px-8 space-y-12">
        <SectionTitle
          eyebrow="Meet Virulmuse"
          title="Your authentic voice, scaled across every channel"
          subtitle="Virulmuse maps your linguistic patterns, sentence rhythm, and signature hooks before generating a single word."
        />

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <Card className="space-y-4 border-card-border">
            <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">
              Standard AI Prompting
            </span>
            <p className="text-sm text-text-secondary italic">
              "🚀 In today's fast-paced digital landscape, consistency is key to unlocking exponential growth! Here are 5 tips..."
            </p>
            <p className="text-xs text-error">
              ✗ Instant scroll-past · Sounds like every other bot
            </p>
          </Card>

          <Card className="space-y-4 border-primary/50 shadow-glow-primary">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              Virulmuse Creator DNA Output
            </span>
            <p className="text-sm text-text-primary font-medium">
              "I wasted 6 months posting daily with zero traction. Everything changed when I stopped chasing volume and fixed my 3-second hook."
            </p>
            <p className="inline-flex items-center gap-1.5 text-xs text-success">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Matches your rhythm, vocabulary, and storytelling arc
            </p>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default Solution;
