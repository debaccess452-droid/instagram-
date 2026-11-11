import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  AuthCard,
  AuthHeader,
  AuthFooter,
  PasswordInput,
  PasswordStrength,
  LoadingButton,
  FormMessage,
} from "@/components/auth";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { ROUTES } from "@/constants/routes";

export const ResetPassword: React.FC = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [hasValidSession, setHasValidSession] = useState(false);

  const { updatePassword, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;

    // Check if there is an active recovery session or access token
    const verifyRecoverySession = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (!isMounted) return;

        if (sessionError || !session) {
          // Check if hash has error from Supabase
          const hash = window.location.hash;
          if (hash.includes("error_description")) {
            const params = new URLSearchParams(hash.replace("#", "?"));
            const desc = params.get("error_description");
            setError(desc ? decodeURIComponent(desc) : "Password recovery link has expired or is invalid.");
          } else {
            setError("No active recovery session found. Please request a new password reset link.");
          }
          setHasValidSession(false);
        } else {
          setHasValidSession(true);
        }
      } catch (err: any) {
        if (isMounted) {
          setError("Failed to verify recovery session. Please try again.");
          setHasValidSession(false);
        }
      } finally {
        if (isMounted) {
          setCheckingSession(false);
        }
      }
    };

    verifyRecoverySession();

    // Also listen for PASSWORD_RECOVERY event
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!isMounted) return;
      if (event === "PASSWORD_RECOVERY" || session) {
        setHasValidSession(true);
        setCheckingSession(false);
        setError("");
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!hasValidSession) {
      setError("Cannot update password without a valid recovery session. Please request a new reset link.");
      return;
    }

    if (password.length < 8) {
      setError("New password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match. Please verify both fields.");
      return;
    }

    setLoading(true);

    try {
      const { error: updateError } = await updatePassword(password);

      if (updateError) {
        setError(updateError.message || "Failed to update password. Please try again.");
        setLoading(false);
        return;
      }

      setSuccess(true);
      setLoading(false);

      // Sign out from the temporary recovery session so user logs in cleanly
      await signOut();

      setTimeout(() => {
        navigate(ROUTES.LOGIN, {
          state: { message: "Password updated successfully. Please sign in with your new password." },
        });
      }, 1800);
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred while updating your password.");
      setLoading(false);
    }
  };

  return (
    <AuthCard>
      <AuthHeader
        title="Set a new password"
        subtitle="Choose a strong password for your Virulmuse account."
      />

      {checkingSession ? (
        <div className="py-8 text-center text-sm text-text-secondary">
          <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent mb-2" />
          <p>Verifying recovery session...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <FormMessage type="error" message={error} />}

          {success && (
            <FormMessage
              type="success"
              message="Password updated successfully! Redirecting to sign in..."
            />
          )}

          {!hasValidSession ? (
            <div className="space-y-3 pt-2">
              <Link to={ROUTES.FORGOT_PASSWORD} className="block">
                <LoadingButton type="button">
                  Request New Reset Link
                </LoadingButton>
              </Link>
            </div>
          ) : (
            <>
              <div>
                <PasswordInput
                  label="New Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 8 characters"
                  disabled={loading || success}
                  required
                />
                <PasswordStrength password={password} />
              </div>

              <div>
                <PasswordInput
                  label="Confirm New Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your new password"
                  disabled={loading || success}
                  required
                />
              </div>

              <LoadingButton
                type="submit"
                isLoading={loading}
                loadingText="Updating password..."
                disabled={success}
              >
                Update Password
              </LoadingButton>
            </>
          )}
        </form>
      )}

      <AuthFooter
        prompt="Remembered your password?"
        linkText="Back to sign in"
        linkTo={ROUTES.LOGIN}
      />
    </AuthCard>
  );
};

export default ResetPassword;
