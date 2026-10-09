import React from "react";
import { Link } from "react-router-dom";
import { PagePlaceholder } from "@/components/common";
import { Button } from "@/components/buttons";
import { ROUTES } from "@/constants/routes";

export const Success: React.FC = () => (
  <PagePlaceholder
    title="Your Creator DNA is Ready!"
    description="Your voice profile has been calibrated with a 92% fidelity match."
    badge="Onboarding Complete"
    action={
      <Link to={ROUTES.DASHBOARD}>
        <Button variant="cta">Enter Creator Dashboard</Button>
      </Link>
    }
  />
);

export default Success;
