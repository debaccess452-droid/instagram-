import React from "react";
import { Dna, Zap, Layers, BarChart3, MessageSquare, ShieldCheck } from "lucide-react";
import { Card } from "@/components/cards";
import { SectionTitle } from "@/components/common";

const FEATURES = [
  {
    icon: Dna,
    title: "Creator DNA Fingerprinting",
    description:
      "Analyzes your best-performing posts to capture your vocabulary, sentence length, humor, and formatting habits.",
  },
  {
    icon: Zap,
    title: "Viral Hook Generator",
    description:
      "Generate 10+ scroll-stopping hooks scored by curiosity gap, clarity, and emotional pull.",
  },
  {
    icon: Layers,
    title: "Multi-Platform Adaptation",
    description:
      "Turn one core idea into an Instagram Reel script, X thread, LinkedIn post, and caption bundle simultaneously.",
  },
  {
    icon: BarChart3,
    title: "Predictive Retention Scoring",
    description:
      "See predicted engagement and hook retention scores before you hit publish.",
  },
  {
    icon: MessageSquare,
    title: "CTA & Conversion Optimizer",
    description:
      "Craft natural calls-to-action tailored to DM automation, newsletter signups, or profile clicks.",
  },
  {
    icon: ShieldCheck,
    title: "Private Voice Vault",
    description:
      "Your writing samples and Creator DNA profile remain strictly private to your workspace.",
  },
];

export const Features: React.FC = () => {
  return (
    <section id="features" className="py-20">
      <div className="mx-auto max-w-container px-4 sm:px-6 lg:px-8 space-y-12">
        <SectionTitle
          eyebrow="Platform Capabilities"
          title="Everything you need to go from rough thought to viral post"
          subtitle="Built specifically for creators who care deeply about quality and authenticity."
        />

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card key={feature.title} interactive className="space-y-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/15 text-primary border border-primary/25">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-text-primary">{feature.title}</h3>
                <p className="text-sm text-text-secondary leading-relaxed">
                  {feature.description}
                </p>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Features;
