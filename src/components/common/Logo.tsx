import React from "react";
import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { cn } from "@/utils/cn";
import { ROUTES } from "@/constants/routes";

export interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({
  className,
  size = "md",
  showText = true,
}) => {
  const iconSizes = {
    sm: "h-7 w-7",
    md: "h-9 w-9",
    lg: "h-11 w-11",
  };

  const textSizes = {
    sm: "text-base",
    md: "text-lg",
    lg: "text-xl",
  };

  return (
    <Link
      to={ROUTES.HOME}
      className={cn(
        "inline-flex items-center gap-2.5 font-bold tracking-tight text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50 rounded-sm",
        className
      )}
    >
      <span
        className={cn(
          "flex items-center justify-center rounded-md bg-gradient-primary-trust text-white shadow-glow-primary",
          iconSizes[size]
        )}
      >
        <Sparkles className="h-4 w-4" />
      </span>
      {showText && (
        <span className={cn("font-extrabold tracking-tight", textSizes[size])}>
          Virul<span className="text-primary">muse</span>
        </span>
      )}
    </Link>
  );
};

export default Logo;
