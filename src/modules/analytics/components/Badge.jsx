import React from "react";

export const Badge = ({ children, variant = "primary" }) => {
  const styles = {
    primary: "bg-primary/15 text-primary border-primary/30",
    success: "bg-success/15 text-success border-success/30",
    warning: "bg-warning/15 text-warning border-warning/30",
  };
  return (
    <span
      className={`inline-flex items-center rounded-sm border px-2 py-0.5 text-xs font-semibold ${
        styles[variant] || styles.primary
      }`}
    >
      {children}
    </span>
  );
};

export default Badge;
