import React from "react";
import { cn } from "@/utils/cn";

export interface LoaderProps {
  size?: "sm" | "md" | "lg";
  label?: string;
  className?: string;
}

export const Loader: React.FC<LoaderProps> = ({
  size = "md",
  label,
  className,
}) => {
  const sizes = {
    sm: "h-4 w-4 border-2",
    md: "h-8 w-8 border-2",
    lg: "h-12 w-12 border-3",
  };

  return (
    <div className={cn("inline-flex flex-col items-center gap-3", className)}>
      <div
        className={cn(
          "animate-spin rounded-full border-primary border-t-transparent",
          sizes[size]
        )}
        role="status"
        aria-label={label || "Loading"}
      />
      {label && <span className="text-sm text-text-secondary">{label}</span>}
    </div>
  );
};

export default Loader;
