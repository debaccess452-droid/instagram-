import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  AuthCard,
  AuthHeader,
  AuthFooter,
  FormField,
  PasswordInput,
  Checkbox,
  LoadingButton,
  FormMessage,
  Divider,
  SocialButton,
} from "@/components/auth";
import { useAuth } from "@/hooks/useAuth";
import { ROUTES } from "@/constants/routes";

export const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      login(email);
      setTimeout(() => navigate(ROUTES.DASHBOARD), 500);
    }, 600);
  };

  return (
    <AuthCard>
      <AuthHeader
        title="Welcome back"
        subtitle="Sign in to access your Creator DNA and content studio."
      />

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <FormMessage type="error" message={error} />}
        {success && (
          <FormMessage
            type="success"
            message="Signed in! Redirecting to your workspace..."
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

        <PasswordInput
          label="Password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <div className="flex items-center justify-between text-xs">
          <Checkbox label="Remember me for 30 days" />
          <Link
            to={ROUTES.FORGOT_PASSWORD}
            className="font-medium text-[#7C3AED] hover:text-[#A855F7]"
          >
            Forgot password?
          </Link>
        </div>

        <LoadingButton type="submit" isLoading={loading} loadingText="Signing in...">
          Sign In
        </LoadingButton>
      </form>

      <Divider />
      <SocialButton
        provider="Google"
        onClick={() => {
          login("alex@virulmuse.ai");
          navigate(ROUTES.DASHBOARD);
        }}
      />

      <AuthFooter
        prompt="Don't have an account?"
        linkText="Create one free"
        linkTo={ROUTES.SIGNUP}
      />
    </AuthCard>
  );
};

export default Login;
