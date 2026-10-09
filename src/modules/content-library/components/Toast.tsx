import React from "react";

export const Toast: React.FC<{ message: string }> = ({ message }) => (
  <div className="fixed bottom-4 right-4 z-50 rounded-md bg-primary px-4 py-2 text-xs font-semibold text-white shadow-glow-primary">
    {message}
  </div>
);

export default Toast;
