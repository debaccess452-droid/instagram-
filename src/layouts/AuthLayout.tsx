import React, { type ReactNode } from "react";
import { Outlet } from "react-router-dom";
import { AuthBackground } from "@/components/auth";

export interface AuthLayoutProps {
  children?: ReactNode;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return <AuthBackground>{children ?? <Outlet />}</AuthBackground>;
};

export default AuthLayout;
