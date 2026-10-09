import React from "react";
import { Logo } from "@/components/common";

export interface AuthHeaderProps {
  title: string;
  subtitle?: string;
}

export const AuthHeader: React.FC<AuthHeaderProps> = ({ title, subtitle }) => {
  return (
    <div className="text-center space-y-2 mb-6">
      <div className="flex justify-center mb-4">
        <Logo size="md" />
      </div>
      <h1 className="text-2xl font-bold tracking-tight text-[#FAFAFA]">{title}</h1>
      {subtitle && <p className="text-sm text-[#A1A1AA]">{subtitle}</p>}
    </div>
  );
};

export default AuthHeader;
