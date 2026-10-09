import React from "react";

export const BillingCard = ({ title, subtitle, children, right }) => (
  <div className="rounded-lg border border-card-border bg-card p-6 shadow-card space-y-4">
    {(title || right) && (
      <div className="flex items-center justify-between gap-4">
        <div>
          {title && <h3 className="text-base font-bold text-text-primary">{title}</h3>}
          {subtitle && <p className="text-xs text-text-secondary">{subtitle}</p>}
        </div>
        {right}
      </div>
    )}
    <div>{children}</div>
  </div>
);

export const StatusBadge = ({ label, variant = "success" }) => (
  <span
    className={`inline-flex items-center rounded-sm px-2.5 py-0.5 text-xs font-semibold ${
      variant === "success"
        ? "bg-success/15 text-success border border-success/30"
        : "bg-primary/15 text-primary border border-primary/30"
    }`}
  >
    {label}
  </span>
);
