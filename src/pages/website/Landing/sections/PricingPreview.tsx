import React from "react";
import { Link } from "react-router-dom";
import { Check } from "lucide-react";
import { Card } from "@/components/cards";
import { Button } from "@/components/buttons";
import { SectionTitle } from "@/components/common";
import { ROUTES } from "@/constants/routes";

const PLANS = [
  {
    name: "Starter",
    price: "$0",
    period: "/forever",
    description: "Test your Creator DNA and generate your first viral scripts.",
    features: [
      "1 Creator DNA voice profile",
      "15 AI content generations / mo",
      "Instagram & X templates",
      "Hook score analysis",
    ],
    cta: "Start Free",
    highlighted: false,
  },
  {
    name: "Creator Pro",
    price: "$29",
    period: "/month",
    description: "Full voice calibration, unlimited multi-platform remixing, and analytics.",
    features: [
      "Unlimited Creator DNA calibration",
      "100 multi-platform campaigns / mo",
      "Reels, Threads, Captions, Hashtags & CTAs",
      "Deep Audience & Engagement Analytics",
      "Priority AI processing",
    ],
    cta: "Start 14-Day Free Trial",
    highlighted: true,
  },
  {
    name: "Studio / Agency",
    price: "$79",
    period: "/month",
    description: "Manage multiple creator voices and brand accounts in one workspace.",
    features: [
      "Up to 10 distinct Creator DNA profiles",
      "Unlimited campaigns & team seats",
      "Custom brand guardrails",
      "Dedicated account strategist",
    ],
    cta: "Contact Sales",
    highlighted: false,
  },
];

export const PricingPreview: React.FC = () => {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-container px-4 sm:px-6 lg:px-8 space-y-12">
        <SectionTitle
          eyebrow="Simple Pricing"
          title="Scale your content output for less than one freelance post"
          subtitle="Start free, upgrade when your content flywheel takes off."
        />

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {PLANS.map((plan) => (
            <Card
              key={plan.name}
              className={`flex flex-col justify-between space-y-6 ${
                plan.highlighted ? "border-primary shadow-glow-primary" : ""
              }`}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-text-primary">{plan.name}</h3>
                  {plan.highlighted && (
                    <span className="rounded-sm bg-primary/20 px-2.5 py-0.5 text-xs font-semibold text-primary">
                      Most Popular
                    </span>
                  )}
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-text-primary">
                    {plan.price}
                  </span>
                  <span className="text-xs text-text-muted">{plan.period}</span>
                </div>
                <p className="text-sm text-text-secondary">{plan.description}</p>
                <ul className="space-y-2.5 pt-2">
                  {plan.features.map((feat) => (
                    <li key={feat} className="flex items-start gap-2 text-sm text-text-primary">
                      <Check className="h-4 w-4 text-success shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Link to={ROUTES.SIGNUP}>
                <Button
                  variant={plan.highlighted ? "cta" : "secondary"}
                  fullWidth
                >
                  {plan.cta}
                </Button>
              </Link>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingPreview;
