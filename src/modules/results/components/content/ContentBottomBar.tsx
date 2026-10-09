import React from "react";
import { Link } from "react-router-dom";
import { ROUTES } from "@/constants/routes";

export const ContentBottomBar: React.FC = () => (
  <div className="flex items-center justify-between pt-4 border-t border-card-border">
    <Link to={ROUTES.RESULTS_OVERVIEW} className="text-xs font-semibold text-text-secondary hover:text-text-primary">
      ← All Campaign Results
    </Link>
    <Link to={ROUTES.GENERATE_CONTENT} className="text-xs font-semibold text-primary hover:underline">
      Generate Another Campaign →
    </Link>
  </div>
);

export default ContentBottomBar;
