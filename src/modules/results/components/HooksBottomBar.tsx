import React from "react";
import { Link } from "react-router-dom";
import { ROUTES } from "@/constants/routes";

export const HooksBottomBar: React.FC = () => (
  <div className="flex justify-between items-center pt-4 border-t border-card-border">
    <Link to={ROUTES.RESULTS_OVERVIEW} className="text-xs font-semibold text-text-secondary hover:text-text-primary">
      ← Back to Results Overview
    </Link>
    <Link to={ROUTES.RESULTS_REEL_SCRIPT} className="text-xs font-semibold text-primary hover:underline">
      Next: Reel Script →
    </Link>
  </div>
);

export default HooksBottomBar;
