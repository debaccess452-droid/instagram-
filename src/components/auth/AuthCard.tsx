import React, { type ReactNode } from "react";
import { cn } from "@/utils/cn";

export interface AuthCardProps {
  children: ReactNode;
  className?: string;
}

export const AuthCard: React.FC<AuthCardProps> = ({ children, className }) => {
  return (
    <div
      className={cn(
        "w-full rounded-2xl border border-[#27272A] bg-[#18181B]/95 p-6 sm:p-8 shadow-2xl backdrop-blur-md animate-auth-slide-up",
        className
      )}
    >
      {children}
    </div>
  );
};

export default AuthCard;
