import React from "react";
import { Link } from "react-router-dom";
import { PagePlaceholder } from "@/components/common";
import { Button } from "@/components/buttons";
import { ROUTES } from "@/constants/routes";

export const AIProcessing: React.FC = () => (
  <PagePlaceholder
    title="Synthesizing Your Creator DNA"
    description="Analyzing linguistic patterns, hook structures, and tone markers..."
    badge="Onboarding · Step 7"
    action={
      <Link to={ROUTES.ONBOARDING_SUCCESS}>
        <Button variant="primary">View Calibration Results</Button>
      </Link>
    }
  />
);

export default AIProcessing;
