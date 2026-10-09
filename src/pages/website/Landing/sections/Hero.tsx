import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Sparkles, ArrowRight, CheckCircle2, Play } from "lucide-react";
import { Button } from "@/components/buttons";
import { ROUTES } from "@/constants/routes";

const DEMO_EXAMPLES = [
  {
    platform: "Instagram Reel Script",
    idea: "Why most creators burn out after 30 days of posting daily",
    output:
      "Hook (0–3s): \"Stop posting every day if your content still sounds like everyone else's.\"\n\nBody: After analyzing 40+ creator burnouts, the culprit isn't consistency—it's voice fatigue. Here's my 3-step batching framework...",
    match: "96% Voice Match",
  },
  {
    platform: "X (Twitter) Thread",
    idea: "3 lessons from scaling my newsletter to 25k subscribers",
    output:
      "1/ Most advice on newsletter growth is outdated.\n\nI went from 800 to 25,400 readers in 7 months without paid ads.\n\nHere are the 3 counter-intuitive shifts that actually moved the needle 🧵👇",
    match: "94% Voice Match",
  },
  {
    platform: "LinkedIn Authority Post",
    idea: "How AI tools should amplify your personal perspective, not replace it",
    output:
      "Unpopular opinion: Generic AI prompts are quietly destroying founder credibility.\n\nYour audience doesn't follow you for encyclopedic summaries. They follow you for your lived scars, frameworks, and point of view.",
    match: "98% Voice Match",
  },
];

export const Hero: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % DEMO_EXAMPLES.length);
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  const current = DEMO_EXAMPLES[activeIndex];

  return (
    <section className="relative overflow-hidden bg-gradient-radial-hero pt-14 pb-20 sm:pt-20 sm:pb-28">
      <div className="mx-auto max-w-container px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Creator DNA™ Engine v2.4 — Personalized Content Generation</span>
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight text-text-primary sm:text-5xl lg:text-6xl leading-[1.12]">
            AI Content That{" "}
            <span className="bg-gradient-primary-trust bg-clip-text text-transparent">
              Sounds Like You
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-text-secondary leading-relaxed max-w-2xl mx-auto">
            Turn rough voice notes and half-baked ideas into high-converting
            Instagram Reels, X threads, and LinkedIn posts—trained on your own
            tone, pacing, and vocabulary.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to={ROUTES.SIGNUP}>
              <Button
                variant="cta"
                size="lg"
                rightIcon={<ArrowRight className="h-4 w-4" />}
              >
                Build Your Creator DNA Free
              </Button>
            </Link>
            <Link to={ROUTES.GENERATE_CONTENT}>
              <Button
                variant="secondary"
                size="lg"
                leftIcon={<Play className="h-4 w-4 text-primary" />}
              >
                Try Interactive Studio
              </Button>
            </Link>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-text-muted">
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-success" />
              No credit card required
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-success" />
              Trained on your past top posts
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-success" />
              Ready in under 60 seconds
            </span>
          </div>
        </div>

        {/* Interactive looping transformation showcase */}
        <div className="mt-14 mx-auto max-w-4xl rounded-lg border border-card-border bg-card/90 p-5 sm:p-8 shadow-glow-primary">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-card-border">
            <div className="flex items-center gap-2">
              {DEMO_EXAMPLES.map((item, idx) => (
                <button
                  key={item.platform}
                  type="button"
                  onClick={() => setActiveIndex(idx)}
                  className={`rounded-sm px-3 py-1.5 text-xs font-semibold transition-colors ${
                    idx === activeIndex
                      ? "bg-primary text-white"
                      : "bg-background-elevated text-text-secondary hover:text-text-primary"
                  }`}
                >
                  {item.platform}
                </button>
              ))}
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-sm bg-success/15 px-2.5 py-1 text-xs font-semibold text-success border border-success/30">
              <Sparkles className="h-3 w-3" />
              {current.match}
            </span>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="rounded-md border border-card-border bg-background p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-2">
                Your Rough Idea
              </p>
              <p className="text-sm sm:text-base text-text-primary font-medium leading-relaxed">
                "{current.idea}"
              </p>
              <div className="mt-6 pt-4 border-t border-card-border/60 flex items-center justify-between text-xs text-text-muted">
                <span>Tone: Candid & Analytical</span>
                <span>Cadence: Punchy</span>
              </div>
            </div>

            <div className="rounded-md border border-primary/40 bg-background-elevated p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-2">
                Virulmuse Output ({current.platform})
              </p>
              <p className="whitespace-pre-line text-sm text-text-primary leading-relaxed">
                {current.output}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
