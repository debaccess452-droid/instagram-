import React from "react";
import { Link } from "react-router-dom";

export interface AuthFooterProps {
  prompt: string;
  linkText: string;
  linkTo: string;
}

export const AuthFooter: React.FC<AuthFooterProps> = ({
  prompt,
  linkText,
  linkTo,
}) => {
  return (
    <p className="mt-6 text-center text-sm text-[#A1A1AA]">
      {prompt}{" "}
      <Link
        to={linkTo}
        className="font-semibold text-[#7C3AED] hover:text-[#A855F7] transition-colors"
      >
        {linkText}
      </Link>
    </p>
  );
};

export default AuthFooter;
