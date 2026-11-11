import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Sparkles, ArrowRight } from "lucide-react";
import {
  AuthCard,
  AuthHeader,
  AuthFooter,
  SocialButton,
  Divider,
  FormMessage,
} from "@/components/auth";
import { ROUTES } from "@/constants/routes";
import { useAuth } from "@/hooks/useAuth";

export const Welcome: React.FC = () => {
  const { signInWithGoogle } = useAuth();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setError("");
    setLoading(true);
    try {
      const { error: authError } = await signInWithGoogle();
      if (authError) {
        setError(authError.message || "Failed to initiate Google sign in.");
        setLoading(false);
      }
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred.");
      setLoading(false);
    }
  };

  return (
    <AuthCard>
      <AuthHeader
        title="Welcome to Virulmuse"
        subtitle="Create high-performing content calibrated to your unique Creator DNA."
      />

      <div className="space-y-3">
        {error && <FormMessage type="error" message={error} />}

        <Link
          to={ROUTES.SIGNUP}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#7C3AED] hover:bg-[#6D28D9] px-4 py-2.5 text-sm font-semibold text-white shadow-glow-primary transition-colors"
        >
          <Sparkles className="h-4 w-4" />
          <span>Get Started with Email</span>
          <ArrowRight className="h-4 w-4" />
        </Link>

        <Divider />

        <SocialButton
          provider="Google"
          onClick={handleGoogleSignIn}
          disabled={loading}
        />
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
