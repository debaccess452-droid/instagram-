import React from "react";
import { ContentPageHeader } from "../components/content/ContentPageHeader";
import { HashtagCard } from "../components/content/HashtagCard";
import { ContentBottomBar } from "../components/content/ContentBottomBar";

export const HashtagsResultPage: React.FC = () => (
  <div className="space-y-6">
    <ContentPageHeader
      title="Curated Hashtag Bundle"
      subtitle="Niche-aligned discovery tags for Instagram and LinkedIn."
    />
    <HashtagCard />
    <ContentBottomBar />
  </div>
);

export default HashtagsResultPage;
