import { useState } from "react";
import { mockCreatorDNA } from "../data/mockCreatorDNA";

export function useCreatorDNA() {
  const [dna, setDna] = useState(mockCreatorDNA);
  const [analyzing, setAnalyzing] = useState(false);

  const recalibrate = (newSample) => {
    setAnalyzing(true);
    setTimeout(() => {
      setDna((prev) => ({
        ...prev,
        overallScore: Math.min(99, prev.overallScore + 1),
        lastUpdated: "Just now",
        keywords: newSample
          ? [...new Set(["Custom Sample", ...prev.keywords])]
          : prev.keywords,
      }));
      setAnalyzing(false);
    }, 500);
  };

  return { dna, analyzing, recalibrate };
}

export default useCreatorDNA;
