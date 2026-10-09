import React from "react";
import { Link } from "react-router-dom";
import { PagePlaceholder } from "@/components/common";
import { Button } from "@/components/buttons";
import { ROUTES } from "@/constants/routes";

export const Welcome: React.FC = () => (
  <PagePlaceholder
    title="Welcome to Creator Onboarding"
    description="Let's set up your Creator DNA profile in a few quick steps."
    badge="Onboarding · Step 1"
    action={
      <Link to={ROUTES.ONBOARDING_CREATOR_TYPE}>
        <Button variant="primary">Continue</Button>
      </Link>
    }
  />
);

export default Welcome;
