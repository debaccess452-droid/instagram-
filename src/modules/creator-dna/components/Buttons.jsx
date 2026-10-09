import React from "react";

export const PrimaryDNAButton = ({ children, onClick, disabled }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className="inline-flex items-center justify-center gap-2 rounded-md bg-purple-glow px-4 py-2 text-xs font-semibold text-white shadow-glow transition-all hover:opacity-95 disabled:opacity-50"
  >
    {children}
  </button>
);

export default PrimaryDNAButton;
