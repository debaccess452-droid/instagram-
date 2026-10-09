import React from "react";

export const ResultsHeader: React.FC = () => (
  <div>
    <h1 className="text-2xl sm:text-3xl font-bold text-text-primary">
      Campaign Results Overview
    </h1>
    <p className="text-sm text-text-secondary">
      Select any asset below to inspect, copy, or customize your generated content.
    </p>
  </div>
);

export default ResultsHeader;
