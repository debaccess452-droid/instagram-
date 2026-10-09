import type { ResultAssetSummary } from "../types/results";
import { ROUTES } from "@/constants/routes";

export const resultsOverview: ResultAssetSummary[] = [
  {
    id: "res_hooks",
    label: "Viral Hooks (10 Scored)",
    description: "Contrarian, curiosity-gap, and authority openers.",
    href: ROUTES.RESULTS_HOOKS,
    score: 96,
  },
  {
    id: "res_reel",
    label: "Instagram Reel Script",
    description: "30-second spoken script with visual beat cues.",
    href: ROUTES.RESULTS_REEL_SCRIPT,
    score: 96,
  },
  {
    id: "res_caption",
    label: "Story-Driven Caption",
    description: "Formatted for high read-through and saves.",
    href: ROUTES.RESULTS_CAPTION,
    score: 95,
  },
  {
    id: "res_threads",
    label: "X / Threads Sequence",
    description: "Multi-post thread with high bookmark potential.",
    href: ROUTES.RESULTS_THREADS,
    score: 94,
  },
  {
    id: "res_hashtags",
    label: "Niche Hashtag Set",
    description: "Curated tags for algorithmic discovery.",
    href: ROUTES.RESULTS_HASHTAGS,
    score: 91,
  },
  {
    id: "res_cta",
    label: "Conversion CTAs",
    description: "DM automation & bookmark calls-to-action.",
    href: ROUTES.RESULTS_CTA,
    score: 95,
  },
];

export default resultsOverview;
