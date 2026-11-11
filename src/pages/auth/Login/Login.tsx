import React, { useState, useEffect } from "react";
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

const REMEMBERED_EMAIL_KEY = "virulmuse_remembered_email";

export const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberEmail, setRememberEmail] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState(false);

  const { signIn, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  // Load remembered email safely on mount
  useEffect(() => {
    try {
      const savedEmail = localStorage.getItem(REMEMBERED_EMAIL_KEY);
      if (savedEmail) {
        setEmail(savedEmail);
        setRememberEmail(true);
      }
    } catch {
      // Ignore storage errors in restricted contexts
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    if (!email.includes("@") || !email.includes(".")) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!password) {
      setError("Please enter your password.");
      return;
    }

    setLoading(true);

    try {
      const { error: authError } = await signIn(email, password);

      if (authError) {
        if (authError.message.toLowerCase().includes("invalid login credentials")) {
          setError("Invalid email or password. Please check your credentials and try again.");
        } else if (authError.message.toLowerCase().includes("email not confirmed")) {
          setError(
            "Your email address has not been verified. Please check your inbox for the verification link."
          );
        } else {
          setError(authError.message || "Failed to sign in. Please try again.");
        }
        setLoading(false);
        return;
      }

      // Handle remembered email safely (never store passwords)
      try {
        if (rememberEmail) {
          localStorage.setItem(REMEMBERED_EMAIL_KEY, email.trim());
        } else {
          localStorage.removeItem(REMEMBERED_EMAIL_KEY);
        }
      } catch {
        // Ignore storage errors
      }

      setSuccess(true);
      setLoading(false);
      navigate(ROUTES.DASHBOARD);
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred during sign in.");
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    setSocialLoading(true);
    try {
      const { error: authError } = await signInWithGoogle();
      if (authError) {
        setError(authError.message || "Failed to initiate Google sign in.");
        setSocialLoading(false);
      }
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred.");
      setSocialLoading(false);
    }
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
            message="Signed in successfully! Redirecting to workspace..."
          />
        )}

        <FormField
          label="Email Address"
          type="email"
          placeholder="you@creator.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
          required
        />

        <PasswordInput
          label="Password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
          required
        />

        <div className="flex items-center justify-between text-xs">
          <Checkbox
            label="Remember my email on this device"
            checked={rememberEmail}
            onChange={(e) => setRememberEmail(e.target.checked)}
          />
          <Link
            to={ROUTES.FORGOT_PASSWORD}
            className="font-medium text-[#7C3AED] hover:text-[#A855F7] transition-colors"
          >
            Forgot password?
          </Link>
        </div>

        <LoadingButton
          type="submit"
          isLoading={loading}
          loadingText="Signing in..."
          disabled={socialLoading}
        >
          Sign In
        </LoadingButton>
      </form>

      <Divider />
      <SocialButton
        provider="Google"
        onClick={handleGoogleSignIn}
        disabled={loading || socialLoading}
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
