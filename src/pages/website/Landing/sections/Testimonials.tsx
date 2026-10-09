import React from "react";
import { Star } from "lucide-react";
import { Card } from "@/components/cards";
import { SectionTitle } from "@/components/common";

const TESTIMONIALS = [
  {
    quote:
      "My audience actually DMs me asking how I write so much without losing my voice. Virulmuse nailed my exact phrasing from day one.",
    author: "Maya Lin",
    role: "Design Founder · 140K on Instagram",
  },
  {
    quote:
      "The Hook Score predictor alone doubled my 3-second Reel retention. I went from 4 hours of scripting to 20 minutes.",
    author: "Marcus Vance",
    role: "B2B SaaS Creator · 85K on X & LinkedIn",
  },
  {
    quote:
      "Every other AI tool made me sound like a corporate press release. Creator DNA is the first engine that gets my dry humor.",
    author: "Elena Rostova",
    role: "Solo Creator · 210K Followers",
  },
];

export const Testimonials: React.FC = () => {
  return (
    <section className="py-20 bg-background-elevated/40 border-y border-card-border">
      <div className="mx-auto max-w-container px-4 sm:px-6 lg:px-8 space-y-12">
        <SectionTitle
          eyebrow="Creator Stories"
          title="Trusted by creators who refuse to sound generic"
        />

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {TESTIMONIALS.map((item) => (
            <Card key={item.author} className="flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-1 text-warning">
                  {[...Array(5)].map((_, idx) => (
                    <Star key={idx} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <p className="text-sm text-text-primary leading-relaxed">
                  "{item.quote}"
                </p>
              </div>
              <div className="pt-3 border-t border-card-border">
                <p className="text-sm font-bold text-text-primary">{item.author}</p>
                <p className="text-xs text-text-secondary">{item.role}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
