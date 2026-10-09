import React from "react";
import { Link } from "react-router-dom";
import { PagePlaceholder } from "@/components/common";
import { Button } from "@/components/buttons";
import { ROUTES } from "@/constants/routes";

export const CreatorType: React.FC = () => (
  <PagePlaceholder
    title="Select Your Creator Archetype"
    description="Choose the primary style that best describes your content."
    badge="Onboarding · Step 2"
    action={
      <Link to={ROUTES.ONBOARDING_PLATFORMS}>
        <Button variant="primary">Next: Platforms</Button>
      </Link>
    }
  />
);

export default CreatorType;
