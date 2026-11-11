import React, { type ReactNode } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { ROUTES } from "@/constants/routes";
import { Loader } from "@/components/common";

export const PublicRoute: React.FC<{ children?: ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader size="lg" label="Checking session..." />
      </div>
    );
  }

  // Allow access to password reset and verification pages even when authenticated in recovery
  const isRecoveryOrNoticePage =
    location.pathname === ROUTES.RESET_PASSWORD ||
    location.pathname === ROUTES.VERIFY_EMAIL ||
    location.pathname === ROUTES.ACCOUNT_CREATED;

  if (isAuthenticated && !isRecoveryOrNoticePage) {
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  return <>{children ?? <Outlet />}</>;
};

export default PublicRoute;
