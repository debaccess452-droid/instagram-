import React from "react";

export const StatCard = ({ label, value, delta, positive = true }) => (
  <div className="rounded-lg border border-card-border bg-card p-5 shadow-card">
    <p className="text-xs font-medium text-text-secondary">{label}</p>
    <p className="mt-2 text-2xl font-extrabold text-text-primary">{value}</p>
    {delta && (
      <p className={`mt-1 text-xs font-semibold ${positive ? "text-success" : "text-error"}`}>
        {delta}
      </p>
    )}
  </div>
);

export default StatCard;
