import React, { type ButtonHTMLAttributes } from "react";
import { Sparkles } from "lucide-react";

export const PrimaryButton: React.FC<ButtonHTMLAttributes<HTMLButtonElement>> = ({
  children,
  ...props
}) => (
  <button
    className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-brand-gradient px-5 py-3 text-sm font-bold text-white shadow-glow-purple transition-all hover:opacity-95"
    {...props}
  >
    <Sparkles className="h-4 w-4" />
    {children}
  </button>
);

export default PrimaryButton;
