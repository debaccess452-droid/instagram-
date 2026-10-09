import React, { useState, type InputHTMLAttributes } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/utils/cn";

export interface PasswordInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const PasswordInput: React.FC<PasswordInputProps> = ({
  label,
  error,
  id,
  className,
  ...props
}) => {
  const [visible, setVisible] = useState(false);
  const inputId = id || label.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="space-y-1.5">
      <label htmlFor={inputId} className="block text-xs font-medium text-[#FAFAFA]">
        {label}
      </label>
      <div className="relative">
        <input
          id={inputId}
          type={visible ? "text" : "password"}
          className={cn(
            "w-full rounded-lg border bg-[#09090B] px-3.5 py-2.5 pr-10 text-sm text-[#FAFAFA] placeholder:text-[#71717A] focus:outline-none focus:ring-2",
            error
              ? "border-error focus:ring-error/30"
              : "border-[#27272A] focus:border-[#7C3AED] focus:ring-[#7C3AED]/30",
            className
          )}
          {...props}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Hide password" : "Show password"}
          className="absolute inset-y-0 right-0 flex items-center pr-3 text-[#71717A] hover:text-[#FAFAFA]"
        >
          {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      {error && <p className="text-xs text-error">{error}</p>}
    </div>
  );
};

export default PasswordInput;
