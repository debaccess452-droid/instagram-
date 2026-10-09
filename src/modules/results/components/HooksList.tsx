import React from "react";
import { hooksResults } from "../data/hooksResults";
import { HookCard } from "./HookCard";

export const HooksList: React.FC = () => (
  <div className="space-y-3">
    {hooksResults.map((h) => (
      <HookCard key={h.id} item={h} />
    ))}
  </div>
);

export default HooksList;
