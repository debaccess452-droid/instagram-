import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  AuthCard,
  AuthHeader,
  AuthFooter,
  FormField,
  PasswordInput,
  PasswordStrength,
  Checkbox,
  LoadingButton,
  FormMessage,
  Divider,
  SocialButton,
  StatusIcon,
} from "@/components/auth";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { ROUTES } from "@/constants/routes";

export const Signup: React.FC = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState(false);

  // Email verification confirmation states
  const [signupComplete, setSignupComplete] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState("");
  const [resendError, setResendError] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);

  const { signUp, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  // Cooldown countdown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const interval = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [resendCooldown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    setResendSuccess("");
    setResendError("");

    if (!name.trim()) {
      setError("Please enter your full name.");
      return;
    }

    if (!email.trim() || !email.includes("@") || !email.includes(".")) {
      setError("Please enter a valid email address.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match. Please verify both fields.");
      return;
    }

    if (!termsAccepted) {
      setError("Please agree to the Terms of Service and Privacy Policy.");
      return;
    }

    setLoading(true);

    try {
      const { error: authError, needsEmailConfirmation } = await signUp(
        email,
        password,
        name
      );

      if (authError) {
        if (
          authError.message.toLowerCase().includes("user already registered") ||
          authError.message.toLowerCase().includes("already exists")
        ) {
          setError(
            "An account with this email address already exists. Please sign in instead."
          );
        } else {
          setError(authError.message || "Failed to create account. Please try again.");
        }
        setLoading(false);
        return;
      }

      setLoading(false);

      if (needsEmailConfirmation) {
        setSignupComplete(true);
        setSuccessMessage(
          `Confirmation link sent to ${email.trim()}. Please check your inbox and confirm your email to activate your account.`
        );
      } else {
        // Direct auto-confirm configured
        navigate(ROUTES.ACCOUNT_CREATED);
      }
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred during signup.");
      setLoading(false);
    }
  };

  const handleResendConfirmation = async () => {
    if (resendLoading || resendCooldown > 0 || !email) return;

    setResendLoading(true);
    setResendError("");
    setResendSuccess("");

    try {
      const { error: resendErr } = await supabase.auth.resend({
        type: "signup",
        email: email.trim(),
        options: {
          emailRedirectTo: `${window.location.origin}/verify-email`,
        },
      });

      if (resendErr) {
        setResendError(
          resendErr.message ||
            "Unable to resend confirmation email. Please wait a moment and try again."
        );
      } else {
        setResendSuccess(
          `A new confirmation email has been sent to ${email.trim()}. Please check your inbox.`
        );
        setResendCooldown(60);
      }
    } catch (err: any) {
      setResendError(err?.message || "An unexpected error occurred while resending.");
    } finally {
      setResendLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    setSocialLoading(true);
    try {
      const { error: authError } = await signInWithGoogle();
      if (authError) {
        setError(authError.message || "Failed to initiate Google sign up.");
        setSocialLoading(false);
      }
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred.");
      setSocialLoading(false);
    }
  };

  if (signupComplete) {
    return (
      <AuthCard className="text-center">
        <StatusIcon variant="email" />
        <AuthHeader
          title="Check your email"
          subtitle={`We sent a confirmation link to ${email}. Click the link in your email to activate your account and start using Virulmuse.`}
        />

        <div className="space-y-3.5 pt-2 text-left">
          {successMessage && <FormMessage type="success" message={successMessage} />}
          {resendSuccess && <FormMessage type="success" message={resendSuccess} />}
          {resendError && <FormMessage type="error" message={resendError} />}

          <LoadingButton
            type="button"
            onClick={handleResendConfirmation}
            isLoading={resendLoading}
            loadingText="Resending confirmation email..."
            disabled={resendLoading || resendCooldown > 0}
            className="bg-card hover:bg-background-elevated text-text-primary border border-card-border shadow-none"
          >
            {resendCooldown > 0
              ? `Resend available in ${resendCooldown}s`
              : "Resend Confirmation Email"}
          </LoadingButton>

          <Link to={ROUTES.LOGIN} className="block">
            <LoadingButton type="button">
              Proceed to Sign In
            </LoadingButton>
          </Link>

          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => {
                setSignupComplete(false);
                setPassword("");
                setConfirmPassword("");
                setSuccessMessage("");
                setResendSuccess("");
                setResendError("");
              }}
              className="text-xs text-text-secondary hover:text-white transition-colors"
            >
              Need to change your email? Back to sign up
            </button>
          </div>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard>
      <AuthHeader
        title="Create your Creator DNA"
        subtitle="Start generating authentic social content in under 60 seconds."
      />

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <FormMessage type="error" message={error} />}
        {successMessage && (
          <FormMessage
            type="success"
            message={successMessage}
          />
        )}

        <FormField
          label="Full Name"
          type="text"
          placeholder="Alex Rivera"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={loading}
          required
        />

        <FormField
          label="Email Address"
          type="email"
          placeholder="you@creator.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
          required
        />

        <div>
          <PasswordInput
            label="Password"
            placeholder="Minimum 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            required
          />
          <PasswordStrength password={password} />
        </div>

        <div>
          <PasswordInput
            label="Confirm Password"
            placeholder="Re-enter your password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={loading}
            required
          />
        </div>

        <Checkbox
          label="I agree to the Terms of Service and Privacy Policy"
          checked={termsAccepted}
          onChange={(e) => setTermsAccepted(e.target.checked)}
        />

        <LoadingButton
          type="submit"
          isLoading={loading}
          loadingText="Creating your account..."
          disabled={socialLoading}
        >
          Create Free Account
        </LoadingButton>
      </form>

      <Divider />
      <SocialButton
        provider="Google"
        onClick={handleGoogleSignIn}
        disabled={loading || socialLoading}
      />

      <AuthFooter
        prompt="Already have an account?"
        linkText="Sign in"
        linkTo={ROUTES.LOGIN}
      />
    </AuthCard>
  );
};

export default Signup;
