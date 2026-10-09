import React from "react";
import { Link } from "react-router-dom";
import { PagePlaceholder } from "@/components/common";
import { Button } from "@/components/buttons";
import { ROUTES } from "@/constants/routes";

export const WritingStyle: React.FC = () => (
  <PagePlaceholder
    title="Calibrate Your Writing Style"
    description="Paste 2–3 sample posts so Virulmuse can map your tone and rhythm."
    badge="Onboarding · Step 4"
    action={
      <Link to={ROUTES.ONBOARDING_GOALS}>
        <Button variant="primary">Next: Goals</Button>
      </Link>
    }
  />
);

export default WritingStyle;
