import React from "react";
import { Link } from "react-router-dom";
import { AuthCard, AuthHeader, StatusIcon, LoadingButton } from "@/components/auth";
import { ROUTES } from "@/constants/routes";

export const VerifyEmail: React.FC = () => {
  return (
    <AuthCard className="text-center">
      <StatusIcon variant="email" />
      <AuthHeader
        title="Check your email"
        subtitle="We sent a verification link to your email address."
      />
      <Link to={ROUTES.ONBOARDING_WELCOME}>
        <LoadingButton type="button">Continue to Onboarding</LoadingButton>
      </Link>
    </AuthCard>
  );
};

export default VerifyEmail;
