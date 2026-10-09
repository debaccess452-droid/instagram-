import React from "react";
import { CreatorDNAScope } from "../components/CreatorDNAScope";
import { CreatorDNACard } from "../components/CreatorDNACard";
import { BreakdownCards } from "../components/BreakdownCards";
import { KeywordTags } from "../components/KeywordTags";
import { ContentSourcesCard } from "../components/ContentSourcesCard";
import { PasteContentCard } from "../components/PasteContentCard";
import { useCreatorDNA } from "../hooks/useCreatorDNA";

export const CreatorDNADashboard = () => {
  const { dna, recalibrate } = useCreatorDNA();

  return (
    <CreatorDNAScope>
      <CreatorDNACard dna={dna} />
      <BreakdownCards items={dna.breakdown} />
      <KeywordTags keywords={dna.keywords} />
      <ContentSourcesCard sources={dna.sources} />
      <PasteContentCard onSave={recalibrate} />
    </CreatorDNAScope>
  );
};

export default CreatorDNADashboard;
