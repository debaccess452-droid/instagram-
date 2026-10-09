import React from "react";

export interface PasswordStrengthProps {
  password: string;
}

export const PasswordStrength: React.FC<PasswordStrengthProps> = ({ password }) => {
  if (!password) return null;

  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  const labels = ["Weak", "Fair", "Good", "Strong"];
  const colors = ["bg-error", "bg-warning", "bg-trust", "bg-success"];
  const idx = Math.max(0, Math.min(score - 1, 3));

  return (
    <div className="space-y-1.5 pt-1">
      <div className="grid grid-cols-4 gap-1.5">
        {[0, 1, 2, 3].map((step) => (
          <div
            key={step}
            className={`h-1 rounded-full transition-colors ${
              step < score ? colors[idx] : "bg-[#27272A]"
            }`}
          />
        ))}
      </div>
      <p className="text-[11px] text-[#A1A1AA]">
        Password strength: <span className="font-medium text-[#FAFAFA]">{labels[idx]}</span>
      </p>
    </div>
  );
};

export default PasswordStrength;
