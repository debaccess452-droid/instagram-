import React, { type ReactNode } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { ROUTES } from "@/constants/routes";
import { Loader } from "@/components/common";

export const ProtectedRoute: React.FC<{ children?: ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  // Show a full-screen loader while validating session to prevent flashing
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader size="lg" label="Verifying session..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  return <>{children ?? <Outlet />}</>;
};

export default ProtectedRoute;
