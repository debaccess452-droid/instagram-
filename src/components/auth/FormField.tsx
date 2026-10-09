import React, { type InputHTMLAttributes } from "react";
import { cn } from "@/utils/cn";

export interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  error,
  id,
  className,
  ...props
}) => {
  const fieldId = id || label.toLowerCase().replace(/\s+/g, "-");
  return (
    <div className="space-y-1.5">
      <label htmlFor={fieldId} className="block text-xs font-medium text-[#FAFAFA]">
        {label}
      </label>
      <input
        id={fieldId}
        className={cn(
          "w-full rounded-lg border bg-[#09090B] px-3.5 py-2.5 text-sm text-[#FAFAFA] placeholder:text-[#71717A] focus:outline-none focus:ring-2",
          error
            ? "border-error focus:ring-error/30"
            : "border-[#27272A] focus:border-[#7C3AED] focus:ring-[#7C3AED]/30",
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-error">{error}</p>}
    </div>
  );
};

export default FormField;
