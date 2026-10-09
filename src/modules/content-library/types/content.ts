export interface ContentItem {
  id: string;
  title: string;
  platform: "Instagram" | "X" | "LinkedIn" | "TikTok";
  type: "Reel Script" | "Thread" | "Caption" | "Hook Bundle";
  excerpt: string;
  dnaMatch: number;
  createdAt: string;
  views?: string;
}
