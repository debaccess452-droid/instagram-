import React from "react";
import { cn } from "../utils/cn";

export const Card: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className }) => (
  <div
    className={cn(
      "rounded-lg border border-card-border bg-card p-6 shadow-dm-card",
      className
    )}
  >
    {children}
  </div>
);

export default Card;
