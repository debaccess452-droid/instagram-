import React from "react";
import { Dna } from "lucide-react";

export const DnaAnimation: React.FC = () => (
  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/15 text-primary border border-primary/30 animate-pulse">
    <Dna className="h-8 w-8" />
  </div>
);

export default DnaAnimation;
