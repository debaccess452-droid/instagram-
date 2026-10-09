import React, { type TextareaHTMLAttributes } from "react";

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
}

export const Textarea: React.FC<TextareaProps> = ({ label, ...props }) => (
  <div className="space-y-1.5">
    {label && <label className="block text-xs font-semibold text-text-primary">{label}</label>}
    <textarea
      rows={4}
      className="w-full rounded-md border border-card-border bg-background px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none"
      {...props}
    />
  </div>
);

export default Textarea;
