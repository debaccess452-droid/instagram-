import React from "react";
import { Link } from "react-router-dom";
import { PagePlaceholder } from "@/components/common";
import { Button } from "@/components/buttons";
import { ROUTES } from "@/constants/routes";

export const Platforms: React.FC = () => (
  <PagePlaceholder
    title="Choose Your Target Platforms"
    description="Select where you publish most frequently (Instagram, X, LinkedIn, TikTok)."
    badge="Onboarding · Step 3"
    action={
      <Link to={ROUTES.ONBOARDING_WRITING_STYLE}>
        <Button variant="primary">Next: Writing Style</Button>
      </Link>
    }
  />
);

export default Platforms;
