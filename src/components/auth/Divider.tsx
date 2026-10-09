import React from "react";

export const Divider: React.FC<{ label?: string }> = ({ label = "or continue with" }) => {
  return (
    <div className="relative my-6">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-[#27272A]" />
      </div>
      <div className="relative flex justify-center text-xs uppercase">
        <span className="bg-[#18181B] px-3 text-[#71717A]">{label}</span>
      </div>
    </div>
  );
};

export default Divider;
