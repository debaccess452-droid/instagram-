import React from "react";

export const Select: React.FC<{
  label?: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
}> = ({ label, options, value, onChange }) => (
  <div className="space-y-1.5">
    {label && <label className="block text-xs font-semibold text-text-primary">{label}</label>}
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-md border border-card-border bg-background px-3.5 py-2.5 text-sm text-text-primary focus:border-primary focus:outline-none"
    >
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  </div>
);

export default Select;
