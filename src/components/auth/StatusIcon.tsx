import React from "react";
import { CheckCircle2, Mail, ShieldCheck, AlertCircle, AlertTriangle } from "lucide-react";

export interface StatusIconProps {
  variant?: "success" | "email" | "security" | "error" | "warning";
}

export const StatusIcon: React.FC<StatusIconProps> = ({ variant = "success" }) => {
  const Icon =
    variant === "email"
      ? Mail
      : variant === "security"
      ? ShieldCheck
      : variant === "error"
      ? AlertCircle
      : variant === "warning"
      ? AlertTriangle
      : CheckCircle2;

  const colorClasses =
    variant === "error"
      ? "bg-rose-500/15 text-rose-500 border-rose-500/30"
      : variant === "warning"
      ? "bg-amber-500/15 text-amber-500 border-amber-500/30"
      : "bg-[#7C3AED]/15 text-[#7C3AED] border-[#7C3AED]/30";

  return (
    <div
      className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border animate-auth-pop ${colorClasses}`}
    >
      <Icon className="h-7 w-7" />
    </div>
  );
};

export default StatusIcon;
