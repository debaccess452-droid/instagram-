import React from "react";
import { Link } from "react-router-dom";
import { AuthCard, AuthHeader, StatusIcon, LoadingButton } from "@/components/auth";
import { ROUTES } from "@/constants/routes";

export const AccountCreated: React.FC = () => {
  return (
    <AuthCard className="text-center">
      <StatusIcon variant="success" />
      <AuthHeader
        title="Account Created!"
        subtitle="Your Creator DNA workspace is ready. Let's calibrate your voice."
      />
      <div className="space-y-3">
        <Link to={ROUTES.DASHBOARD} className="block">
          <LoadingButton type="button">Launch Creator Dashboard</LoadingButton>
        </Link>
      </div>
    </AuthCard>
  );
};

export default AccountCreated;
