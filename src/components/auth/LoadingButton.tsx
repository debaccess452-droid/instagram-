import React, { type ButtonHTMLAttributes } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/utils/cn";

export interface LoadingButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  loadingText?: string;
}

export const LoadingButton: React.FC<LoadingButtonProps> = ({
  isLoading = false,
  loadingText = "Please wait...",
  children,
  className,
  disabled,
  ...props
}) => {
  return (
    <button
      disabled={isLoading || disabled}
      className={cn(
        "w-full inline-flex items-center justify-center gap-2 rounded-lg bg-[#7C3AED] hover:bg-[#6D28D9] px-4 py-2.5 text-sm font-semibold text-white shadow-glow-primary transition-all focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/50 disabled:opacity-60",
        className
      )}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>{loadingText}</span>
        </>
      ) : (
        children
      )}
    </button>
  );
};

export default LoadingButton;
