import React, { useState } from "react";
import {
  AuthCard,
  AuthHeader,
  AuthFooter,
  FormField,
  LoadingButton,
  FormMessage,
} from "@/components/auth";
import { useAuth } from "@/hooks/useAuth";
import { ROUTES } from "@/constants/routes";

export const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  const { resetPasswordForEmail } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !email.includes("@") || !email.includes(".")) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);

    try {
      const { error: resetError } = await resetPasswordForEmail(email);

      if (resetError) {
        setError(resetError.message || "Failed to send reset link. Please try again.");
        setLoading(false);
        return;
      }

      setLoading(false);
      setSent(true);
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <AuthCard>
      <AuthHeader
        title="Reset your password"
        subtitle="Enter your email and we'll send you a password reset link."
      />

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <FormMessage type="error" message={error} />}

        {sent && (
          <FormMessage
            type="success"
            message="If an account exists with this email address, password reset instructions have been sent. Please check your inbox and spam folder."
          />
        )}

        <FormField
          label="Email Address"
          type="email"
          placeholder="you@creator.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading || sent}
          required
        />

        <LoadingButton
          type="submit"
          isLoading={loading}
          loadingText="Sending reset link..."
          disabled={sent}
        >
          {sent ? "Instructions Sent" : "Send Reset Link"}
        </LoadingButton>
      </form>

      <AuthFooter
        prompt="Remembered your password?"
        linkText="Back to sign in"
        linkTo={ROUTES.LOGIN}
      />
    </AuthCard>
  );
};

export default ForgotPassword;
