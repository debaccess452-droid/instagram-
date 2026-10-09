import { mockDashboard } from "../data/mockDashboard";
import { mockAudience } from "../data/mockAudience";
import { mockContent } from "../data/mockContent";
import { mockEngagement } from "../data/mockEngagement";
import { mockGrowth } from "../data/mockGrowth";
import { mockPlatform } from "../data/mockPlatform";
import { mockPostingTime } from "../data/mockPostingTime";

export function useMockData() {
  return {
    dashboard: mockDashboard,
    audience: mockAudience,
    content: mockContent,
    engagement: mockEngagement,
    growth: mockGrowth,
    platform: mockPlatform,
    postingTime: mockPostingTime,
    isLoading: false,
  };
}

export default useMockData;
