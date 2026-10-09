import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import { SectionTitle } from "@/components/common";

const FAQS = [
  {
    q: "How does Virulmuse learn my writing voice?",
    a: "When you import your past Instagram posts, threads, or writing samples, our Creator DNA engine analyzes your sentence cadence, hook structure, vocabulary preferences, and formatting style.",
  },
  {
    q: "Will my content sound like ChatGPT?",
    a: "No. Virulmuse explicitly filters out generic AI clichés and enforces your personal Creator DNA profile on every hook, script, and caption.",
  },
  {
    q: "Which platforms are supported?",
    a: "Instagram (Reels scripts, captions, carousels, hashtags), X/Twitter (threads and single posts), LinkedIn, TikTok, and YouTube Shorts.",
  },
  {
    q: "Can I edit or recalibrate my Creator DNA anytime?",
    a: "Yes! You can add new top-performing posts, adjust tone sliders, or update your niche keywords inside your Creator DNA dashboard at any time.",
  },
];

export const FAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="py-20 bg-background-elevated/40 border-t border-card-border">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 space-y-10">
        <SectionTitle
          eyebrow="FAQ"
          title="Frequently asked questions"
          subtitle="Everything you need to know about Virulmuse and Creator DNA."
        />

        <div className="space-y-3">
          {FAQS.map((item, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={item.q}
                className="rounded-md border border-card-border bg-card overflow-hidden"
              >
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="flex w-full items-center justify-between px-5 py-4 text-left text-sm sm:text-base font-semibold text-text-primary hover:bg-white/5 focus:outline-none"
                >
                  <span>{item.q}</span>
                  <ChevronDown
                    className={`h-4 w-4 text-text-secondary transition-transform ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-4 text-sm text-text-secondary leading-relaxed border-t border-card-border/50 pt-3">
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FAQ;
