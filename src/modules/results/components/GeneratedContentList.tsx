import React from "react";
import { resultsOverview } from "../data/resultsOverview";
import { GeneratedContentRow } from "./GeneratedContentRow";

export const GeneratedContentList: React.FC = () => (
  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
    {resultsOverview.map((item) => (
      <GeneratedContentRow key={item.id} item={item} />
    ))}
  </div>
);

export default GeneratedContentList;
