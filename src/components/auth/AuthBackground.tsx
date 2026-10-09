import React, { type ReactNode } from "react";

export const AuthBackground: React.FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#09090B] text-[#FAFAFA] flex flex-col justify-center items-center px-4 py-12">
      <div
        className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-96 w-[640px] rounded-full bg-[#7C3AED]/15 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute bottom-0 right-1/4 h-72 w-72 rounded-full bg-[#2563EB]/10 blur-3xl"
        aria-hidden="true"
      />
      <div className="relative z-10 w-full max-w-md">{children}</div>
    </div>
  );
};

export default AuthBackground;
