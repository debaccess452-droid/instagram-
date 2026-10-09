import React from "react";
import { Link } from "react-router-dom";
import { Sparkles, ArrowRight } from "lucide-react";
import {
  AuthCard,
  AuthHeader,
  AuthFooter,
  SocialButton,
  Divider,
} from "@/components/auth";
import { ROUTES } from "@/constants/routes";

export const Welcome: React.FC = () => {
  return (
    <AuthCard>
      <AuthHeader
        title="Welcome to Virulmuse"
        subtitle="Create high-performing content calibrated to your unique Creator DNA."
      />

      <div className="space-y-3">
        <Link
          to={ROUTES.SIGNUP}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#7C3AED] hover:bg-[#6D28D9] px-4 py-2.5 text-sm font-semibold text-white shadow-glow-primary transition-colors"
        >
          <Sparkles className="h-4 w-4" />
          <span>Get Started with Email</span>
          <ArrowRight className="h-4 w-4" />
        </Link>

        <Divider />

        <SocialButton provider="Google" />
      </div>

      <AuthFooter
        prompt="Already have an account?"
        linkText="Sign in"
        linkTo={ROUTES.LOGIN}
      />
    </AuthCard>
  );
};

export default Welcome;
