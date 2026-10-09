import React, { type ButtonHTMLAttributes } from "react";
import { cn } from "@/utils/cn";

export interface SocialButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  provider: string;
  icon?: React.ReactNode;
}

export const SocialButton: React.FC<SocialButtonProps> = ({
  provider,
  icon,
  className,
  ...props
}) => {
  return (
    <button
      type="button"
      className={cn(
        "flex w-full items-center justify-center gap-2.5 rounded-lg border border-[#27272A] bg-[#09090B] px-4 py-2.5 text-sm font-medium text-[#FAFAFA] hover:bg-[#27272A]/50 transition-colors",
        className
      )}
      {...props}
    >
      {icon}
      <span>Continue with {provider}</span>
    </button>
  );
};

export default SocialButton;
