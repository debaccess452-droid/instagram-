import type { ContentItem } from "../types/content";

export const mockLibraryContent: ContentItem[] = [
  {
    id: "cnt_01",
    title: "Why daily posting fails without a 3-second hook",
    platform: "Instagram",
    type: "Reel Script",
    excerpt:
      "Stop posting every day if your opening 3 seconds sound like a textbook introduction...",
    dnaMatch: 96,
    createdAt: "2 hours ago",
    views: "148K",
  },
  {
    id: "cnt_02",
    title: "7 counter-intuitive lessons from scaling to 25K subscribers",
    platform: "X",
    type: "Thread",
    excerpt:
      "1/ Most newsletter growth advice is outdated. Here is the exact playbook we used...",
    dnaMatch: 94,
    createdAt: "Yesterday",
    views: "82K",
  },
  {
    id: "cnt_03",
    title: "Why generic AI prompts hurt founder authority",
    platform: "LinkedIn",
    type: "Caption",
    excerpt:
      "Your audience doesn't follow you for encyclopedic summaries—they follow your lived perspective.",
    dnaMatch: 98,
    createdAt: "3 days ago",
    views: "64K",
  },
];

export default mockLibraryContent;
