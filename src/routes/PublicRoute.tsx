import React, { type ReactNode } from "react";
import { Outlet } from "react-router-dom";

export const PublicRoute: React.FC<{ children?: ReactNode }> = ({ children }) => {
  return <>{children ?? <Outlet />}</>;
};

export default PublicRoute;
