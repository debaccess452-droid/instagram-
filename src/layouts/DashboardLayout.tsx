import React, { type ReactNode } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "@/components/navigation";
import { Topbar } from "@/components/layout";

export interface DashboardLayoutProps {
  children?: ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex bg-background text-text-primary">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children ?? <Outlet />}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
