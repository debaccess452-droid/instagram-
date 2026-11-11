import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  AuthCard,
  AuthHeader,
  StatusIcon,
  LoadingButton,
  FormField,
  FormMessage,
} from "@/components/auth";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { ROUTES } from "@/constants/routes";

type VerificationStatus = "checking" | "expired" | "success" | "pending";

export const VerifyEmail: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { session, isAuthenticated } = useAuth();

  const [status, setStatus] = useState<VerificationStatus>("checking");
  const [errorMessage, setErrorMessage] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState("");
  const [resendError, setResendError] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);

  // Cooldown countdown
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  useEffect(() => {
    let isMounted = true;

    const processVerification = async () => {
      // 1. Inspect URL hash and query string for Supabase parameters
      const hash = window.location.hash || "";
      const search = window.location.search || "";
      const searchParams = new URLSearchParams(search);
      const hashParams = new URLSearchParams(hash.replace(/^#/, ""));

      const errorCode =
        hashParams.get("error_code") || searchParams.get("error_code") || "";
      const error = hashParams.get("error") || searchParams.get("error") || "";
      const errorDescription =
        hashParams.get("error_description") ||
        searchParams.get("error_description") ||
        "";
      const accessToken = hashParams.get("access_token");
      const type = hashParams.get("type");
      const code = searchParams.get("code");

      // Extract pre-filled email if available in search or navigation state
      const prefillEmail =
        searchParams.get("email") ||
        (location.state as { email?: string } | null)?.email ||
        "";
      if (prefillEmail && isMounted) {
        setEmailInput(prefillEmail);
      }

      // Check for expired or invalid OTP error
      const isExpired =
        errorCode === "otp_expired" ||
        error === "access_denied" ||
        errorDescription.toLowerCase().includes("expired") ||
        errorDescription.toLowerCase().includes("invalid");

      if (isExpired || error) {
        if (!isMounted) return;
        setStatus("expired");
        if (errorDescription) {
          const decoded = decodeURIComponent(errorDescription).replace(/\+/g, " ");
          setErrorMessage(
            decoded.includes("expired") || decoded.includes("invalid")
              ? "Your confirmation link has expired or has already been used. Please request a fresh confirmation link below."
              : decoded
          );
        } else {
          setErrorMessage(
            "Your confirmation link has expired or has already been used. Please request a fresh confirmation link below."
          );
        }
        return;
      }

      // Handle PKCE code exchange if present in query parameters
      if (code) {
        try {
          const { data, error: exchangeError } =
            await supabase.auth.exchangeCodeForSession(code);
          if (!isMounted) return;

          if (exchangeError) {
            setStatus("expired");
            setErrorMessage(
              exchangeError.message ||
                "Failed to verify confirmation link. It may have expired or was already used."
            );
            return;
          }

          if (data.session) {
            setStatus("success");
            return;
          }
        } catch {
          if (!isMounted) return;
          setStatus("expired");
          setErrorMessage(
            "Unable to process verification code. Please request a fresh confirmation email."
          );
          return;
        }
      }

      // Check if access_token in hash or active session confirms user
      if (accessToken && (type === "signup" || type === "email_change" || !type)) {
        if (!isMounted) return;
        setStatus("success");
        return;
      }

      // Check current session from Supabase
      try {
        const {
          data: { session: currentSession },
        } = await supabase.auth.getSession();
        if (!isMounted) return;

        if (currentSession?.user?.email_confirmed_at) {
          setStatus("success");
          return;
        }
      } catch (err) {
        console.warn("[VerifyEmail] getSession check:", err);
      }

      // Default: waiting for confirmation
      if (isMounted) {
        setStatus("pending");
      }
    };

    processVerification();

    // Listen for auth state changes (e.g. Supabase finishes setting session from hash)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, newSession) => {
      if (!isMounted) return;
      if (
        (event === "SIGNED_IN" || event === "USER_UPDATED") &&
        newSession?.user?.email_confirmed_at
      ) {
        setStatus("success");
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [location.state]);

  const handleResend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (resendLoading || resendCooldown > 0) return;

    const targetEmail = emailInput.trim();
    if (!targetEmail || !targetEmail.includes("@") || !targetEmail.includes(".")) {
      setResendError("Please enter a valid email address to receive a new link.");
      return;
    }

    setResendLoading(true);
    setResendError("");
    setResendSuccess("");

    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: targetEmail,
        options: {
          emailRedirectTo: `${window.location.origin}/verify-email`,
        },
      });

      if (error) {
        setResendError(
          error.message ||
            "Unable to resend confirmation email. Please wait a moment and try again."
        );
      } else {
        setResendSuccess(
          `A fresh confirmation link has been sent to ${targetEmail}. Please check your inbox and spam folder.`
        );
        setResendCooldown(60);
      }
    } catch (err: any) {
      setResendError(err?.message || "An unexpected error occurred while resending.");
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <AuthCard className="text-center">
      {status === "checking" && (
        <div className="py-8">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent mb-3" />
          <p className="text-sm text-text-secondary">Verifying your email link...</p>
        </div>
      )}

      {status === "expired" && (
        <>
          <StatusIcon variant="error" />
          <AuthHeader
            title="Confirmation link expired"
            subtitle="This confirmation link has expired or has already been used. Please request a new confirmation email below."
          />

          <div className="space-y-4 pt-1 text-left">
            {errorMessage && <FormMessage type="error" message={errorMessage} />}
            {resendSuccess && <FormMessage type="success" message={resendSuccess} />}
            {resendError && <FormMessage type="error" message={resendError} />}

            <form onSubmit={handleResend} className="space-y-3">
              <FormField
                label="Registered Email Address"
                type="email"
                placeholder="you@example.com"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                disabled={resendLoading}
                required
              />

              <LoadingButton
                type="submit"
                isLoading={resendLoading}
                loadingText="Sending new link..."
                disabled={resendLoading || resendCooldown > 0}
              >
                {resendCooldown > 0
                  ? `Resend available in ${resendCooldown}s`
                  : "Send Fresh Confirmation Email"}
              </LoadingButton>
            </form>

            <div className="pt-2 flex flex-col gap-2">
              <Link to={ROUTES.LOGIN} className="block">
                <LoadingButton
                  type="button"
                  className="bg-card hover:bg-background-elevated text-text-primary border border-card-border shadow-none"
                >
                  Return to Sign In
                </LoadingButton>
              </Link>
              <Link to={ROUTES.SIGNUP} className="block">
                <LoadingButton
                  type="button"
                  className="bg-transparent hover:bg-white/5 text-text-secondary hover:text-white border border-card-border/60 shadow-none text-xs py-2"
                >
                  Create a New Account
                </LoadingButton>
              </Link>
            </div>
          </div>
        </>
      )}

      {status === "success" && (
        <>
          <StatusIcon variant="success" />
          <AuthHeader
            title="Email verified successfully!"
            subtitle="Your email address has been verified and your account is active. You can now access all Virulmuse features."
          />

          <div className="space-y-3 pt-3">
            {session || isAuthenticated ? (
              <LoadingButton
                type="button"
                onClick={() => navigate(ROUTES.DASHBOARD)}
              >
                Continue to Dashboard
              </LoadingButton>
            ) : (
              <Link to={ROUTES.LOGIN} className="block">
                <LoadingButton type="button">
                  Sign In to Your Account
                </LoadingButton>
              </Link>
            )}
          </div>
        </>
      )}

      {status === "pending" && (
        <>
          <StatusIcon variant="email" />
          <AuthHeader
            title="Check your email"
            subtitle="We sent a verification link to your email address. Please click the link to confirm and activate your account."
          />

          <div className="space-y-4 pt-1 text-left">
            {resendSuccess && <FormMessage type="success" message={resendSuccess} />}
            {resendError && <FormMessage type="error" message={resendError} />}

            <form onSubmit={handleResend} className="space-y-3">
              <FormField
                label="Didn't receive the email? Enter your address to resend"
                type="email"
                placeholder="you@example.com"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                disabled={resendLoading}
                required
              />

              <LoadingButton
                type="submit"
                isLoading={resendLoading}
                loadingText="Resending confirmation email..."
                disabled={resendLoading || resendCooldown > 0}
                className="bg-card hover:bg-background-elevated text-text-primary border border-card-border shadow-none"
              >
                {resendCooldown > 0
                  ? `Resend available in ${resendCooldown}s`
                  : "Resend Confirmation Email"}
              </LoadingButton>
            </form>

            <Link to={ROUTES.LOGIN} className="block pt-1">
              <LoadingButton
                type="button"
                className="bg-transparent hover:bg-white/5 text-text-secondary hover:text-white border border-card-border/60 shadow-none text-xs py-2"
              >
                Back to Sign In
              </LoadingButton>
            </Link>
          </div>
        </>
      )}
    </AuthCard>
  );
};

export default VerifyEmail;
