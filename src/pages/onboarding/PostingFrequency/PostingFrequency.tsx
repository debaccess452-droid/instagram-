import React from "react";
import { Link } from "react-router-dom";
import { PagePlaceholder } from "@/components/common";
import { Button } from "@/components/buttons";
import { ROUTES } from "@/constants/routes";

export const PostingFrequency: React.FC = () => (
  <PagePlaceholder
    title="Target Posting Cadence"
    description="Choose how many weekly pieces of content you want Virulmuse to prepare."
    badge="Onboarding · Step 6"
    action={
      <Link to={ROUTES.ONBOARDING_AI_PROCESSING}>
        <Button variant="primary">Analyze Creator DNA</Button>
      </Link>
    }
  />
);

export default PostingFrequency;
