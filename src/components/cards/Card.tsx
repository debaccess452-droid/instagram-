import React, { type HTMLAttributes } from "react";
import { cn } from "@/utils/cn";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  elevated?: boolean;
  interactive?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
}

export const Card: React.FC<CardProps> = ({
  elevated = false,
  interactive = false,
  padding = "md",
  className,
  children,
  ...props
}) => {
  const paddings = {
    none: "",
    sm: "p-4",
    md: "p-6",
    lg: "p-8",
  };

  return (
    <div
      className={cn(
        "rounded-lg border border-card-border shadow-card transition-all duration-200",
        elevated ? "bg-background-elevated" : "bg-card",
        interactive && "hover:border-primary/40 hover:-translate-y-0.5",
        paddings[padding],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
