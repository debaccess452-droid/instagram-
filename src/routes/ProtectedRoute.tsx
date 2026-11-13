import React, { type ReactNode } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { ROUTES } from "@/constants/routes";
import { Loader } from "@/components/common";

export const ProtectedRoute: React.FC<{ children?: ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading, isLoggingOut } = useAuth();
  const location = useLocation();

  // Show a full-screen loader while validating session to prevent flashing
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader size="lg" label="Verifying session..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    if (isLoggingOut) {
      return <Navigate to={ROUTES.HOME} replace />;
    }

    const from = `${location.pathname}${location.search}${location.hash}`;
    return <Navigate to={ROUTES.LOGIN} state={{ from }} replace />;
  }

  return <>{children ?? <Outlet />}</>;
};

export default ProtectedRoute;
