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
        subtitle="We sent a verification link to your email address. Please click the link to confirm and activate your account."
      />
      <div className="space-y-3 pt-2">
        <Link to={ROUTES.LOGIN} className="block">
          <LoadingButton type="button">Back to Sign In</LoadingButton>
        </Link>
      </div>
    </AuthCard>
  );
};

export default VerifyEmail;
