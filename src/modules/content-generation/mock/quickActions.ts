import type { QuickActionItem } from "../types/dashboard";
import { ROUTES } from "@/constants/routes";

export const quickActions: QuickActionItem[] = [
  {
    id: "qa_generate",
    title: "Generate New Campaign",
    description: "Turn one rough idea into Hooks, Reel Script, Captions & Thread.",
    href: ROUTES.GENERATE_CONTENT,
    badge: "Creator DNA",
  },
  {
    id: "qa_results",
    title: "Latest Generated Bundle",
    description: "Inspect scored hooks, scripts, hashtags, and CTAs.",
    href: ROUTES.RESULTS_OVERVIEW,
  },
  {
    id: "qa_dna",
    title: "Calibrate Creator DNA",
    description: "Add new top-performing posts to sharpen your voice model.",
    href: ROUTES.PROFILE,
  },
];

export default quickActions;
