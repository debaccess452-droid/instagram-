import React, { type InputHTMLAttributes } from "react";
import { cn } from "@/utils/cn";

export interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  label: React.ReactNode;
}

export const Checkbox: React.FC<CheckboxProps> = ({ label, className, id, ...props }) => {
  const checkboxId = id || "auth-checkbox";
  return (
    <label
      htmlFor={checkboxId}
      className={cn("inline-flex items-start gap-2.5 text-sm text-[#A1A1AA] cursor-pointer select-none", className)}
    >
      <input
        id={checkboxId}
        type="checkbox"
        className="mt-0.5 h-4 w-4 rounded border-[#27272A] bg-[#09090B] text-[#7C3AED] focus:ring-[#7C3AED]/40"
        {...props}
      />
      <span>{label}</span>
    </label>
  );
};

export default Checkbox;
