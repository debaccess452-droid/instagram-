import React from "react";
import { Link } from "react-router-dom";
import { Card } from "../Card";
import { ROUTES } from "@/constants/routes";

export const WhatsNextCard: React.FC = () => (
  <Card className="flex flex-col sm:flex-row items-center justify-between gap-4">
    <div>
      <p className="text-sm font-bold text-text-primary">Your Multi-Platform Bundle is Ready</p>
      <p className="text-xs text-text-secondary">
        Review scored hooks, Reel scripts, captions, threads, and CTAs.
      </p>
    </div>
    <Link
      to={ROUTES.RESULTS_OVERVIEW}
      className="rounded-md bg-primary hover:bg-primary-hover px-4 py-2 text-xs font-semibold text-white"
    >
      Open Results Bundle
    </Link>
  </Card>
);

export default WhatsNextCard;
