import React from "react";

export const QuickNavCard = ({ title, description, active, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`w-full text-left rounded-md border p-3.5 transition-all ${
      active
        ? "border-primary bg-primary/15 text-text-primary"
        : "border-card-border bg-card hover:border-primary/40 text-text-secondary"
    }`}
  >
    <p className="text-sm font-bold text-text-primary">{title}</p>
    {description && <p className="mt-0.5 text-xs text-text-secondary">{description}</p>}
  </button>
);

export default QuickNavCard;
