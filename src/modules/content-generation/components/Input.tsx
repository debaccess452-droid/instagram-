import React, { type InputHTMLAttributes } from "react";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Input: React.FC<InputProps> = ({ label, ...props }) => (
  <div className="space-y-1.5">
    {label && <label className="block text-xs font-semibold text-text-primary">{label}</label>}
    <input
      className="w-full rounded-md border border-card-border bg-background px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none"
      {...props}
    />
  </div>
);

export default Input;
