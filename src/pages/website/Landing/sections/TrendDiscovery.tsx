import React from "react";
import { Flame, TrendingUp } from "lucide-react";
import { Card } from "@/components/cards";
import { SectionTitle } from "@/components/common";

const TRENDS = [
  {
    topic: "Behind-the-scenes founder workflows",
    velocity: "+142% engagement this week",
    format: "Instagram 30s Reel",
  },
  {
    topic: "Contrarian breakdown of AI tools",
    velocity: "+98% bookmark rate",
    format: "X 6-Post Thread",
  },
  {
    topic: "Transparent revenue & metric lessons",
    velocity: "+115% profile visits",
    format: "LinkedIn Carousel / Text",
  },
];

export const TrendDiscovery: React.FC = () => {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-container px-4 sm:px-6 lg:px-8 space-y-12">
        <SectionTitle
          eyebrow="Trend Discovery"
          title="Spot rising formats in your niche before they peak"
          subtitle="Pair real-time format velocity with your personal Creator DNA."
        />

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {TRENDS.map((trend) => (
            <Card key={trend.topic} className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-cta">
                  <Flame className="h-3.5 w-3.5" />
                  {trend.format}
                </span>
                <TrendingUp className="h-4 w-4 text-success" />
              </div>
              <h3 className="text-base font-bold text-text-primary">{trend.topic}</h3>
              <p className="text-xs font-medium text-success">{trend.velocity}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrendDiscovery;
