import React from "react";
import { CheckCircle2, Mail, ShieldCheck } from "lucide-react";

export interface StatusIconProps {
  variant?: "success" | "email" | "security";
}

export const StatusIcon: React.FC<StatusIconProps> = ({ variant = "success" }) => {
  const Icon =
    variant === "email" ? Mail : variant === "security" ? ShieldCheck : CheckCircle2;

  return (
    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#7C3AED]/15 text-[#7C3AED] border border-[#7C3AED]/30 animate-auth-pop">
      <Icon className="h-7 w-7" />
    </div>
  );
};

export default StatusIcon;
