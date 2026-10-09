import React, { useState } from "react";
import {
  AuthCard,
  AuthHeader,
  AuthFooter,
  FormField,
  LoadingButton,
  FormMessage,
} from "@/components/auth";
import { ROUTES } from "@/constants/routes";

export const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.includes("@")) {
      setSent(true);
    }
  };

  return (
    <AuthCard>
      <AuthHeader
        title="Reset your password"
        subtitle="Enter your email and we'll send you a password reset link."
      />
      <form onSubmit={handleSubmit} className="space-y-4">
        {sent && (
          <FormMessage
            type="success"
            message="Reset instructions have been sent to your inbox."
          />
        )}
        <FormField
          label="Email Address"
          type="email"
          placeholder="you@creator.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <LoadingButton type="submit">Send Reset Link</LoadingButton>
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
