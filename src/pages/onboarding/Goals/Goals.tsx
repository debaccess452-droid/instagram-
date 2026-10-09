import React from "react";
import { Link } from "react-router-dom";
import { PagePlaceholder } from "@/components/common";
import { Button } from "@/components/buttons";
import { ROUTES } from "@/constants/routes";

export const Goals: React.FC = () => (
  <PagePlaceholder
    title="Your Growth Goals"
    description="Define whether you're optimizing for reach, follower growth, or inbound leads."
    badge="Onboarding · Step 5"
    action={
      <Link to={ROUTES.ONBOARDING_POSTING_FREQUENCY}>
        <Button variant="primary">Next: Posting Frequency</Button>
      </Link>
    }
  />
);

export default Goals;
