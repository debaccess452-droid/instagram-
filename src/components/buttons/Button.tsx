import React, { type ButtonHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/utils/cn";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "cta" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  size = "md",
  leftIcon,
  rightIcon,
  fullWidth = false,
  className,
  children,
  ...props
}) => {
  const variants = {
    primary:
      "bg-primary hover:bg-primary-hover text-white shadow-glow-primary border border-primary/40",
    cta: "bg-cta hover:bg-cta-hover text-white shadow-glow-cta border border-cta/40",
    secondary:
      "bg-card hover:bg-background-elevated text-text-primary border border-card-border",
    outline:
      "bg-transparent hover:bg-white/5 text-text-primary border border-card-border hover:border-primary/50",
    ghost: "bg-transparent hover:bg-white/5 text-text-secondary hover:text-text-primary",
  };

  const sizes = {
    sm: "px-3.5 py-2 text-xs font-medium rounded-sm",
    md: "px-5 py-2.5 text-sm font-semibold rounded-md",
    lg: "px-6 py-3.5 text-base font-semibold rounded-md",
  };

  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 disabled:pointer-events-none",
        variants[variant],
        sizes[size],
        fullWidth && "w-full",
        className
      )}
      {...props}
    >
      {leftIcon}
      {children}
      {rightIcon}
    </button>
  );
};

export default Button;
