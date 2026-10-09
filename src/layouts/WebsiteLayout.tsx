import React, { type ReactNode } from "react";
import { Outlet } from "react-router-dom";
import { Navbar, Footer } from "@/components/layout";

export interface WebsiteLayoutProps {
  children?: ReactNode;
}

export const WebsiteLayout: React.FC<WebsiteLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-background text-text-primary">
      <Navbar />
      <main className="flex-1 mx-auto w-full max-w-container px-4 py-12 sm:px-6 lg:px-8">
        {children ?? <Outlet />}
      </main>
      <Footer />
    </div>
  );
};

export default WebsiteLayout;
