import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
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
} from "@/components/auth";
import { useAuth } from "@/hooks/useAuth";
import { ROUTES } from "@/constants/routes";

export const Signup: React.FC = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!name.trim()) {
      setError("Please enter your name or creator handle.");
      return;
    }
    if (!email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      login(email, name);
      navigate(ROUTES.ACCOUNT_CREATED);
    }, 600);
  };

  return (
    <AuthCard>
      <AuthHeader
        title="Create your Creator DNA"
        subtitle="Start generating authentic social content in under 60 seconds."
      />

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <FormMessage type="error" message={error} />}

        <FormField
          label="Full Name or Handle"
          type="text"
          placeholder="Alex Rivera"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <FormField
          label="Work or Creator Email"
          type="email"
          placeholder="you@creator.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <div>
          <PasswordInput
            label="Create Password"
            placeholder="Minimum 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <PasswordStrength password={password} />
        </div>

        <Checkbox
          label="I agree to the Terms of Service and Privacy Policy"
          defaultChecked
        />

        <LoadingButton
          type="submit"
          isLoading={loading}
          loadingText="Creating your workspace..."
        >
          Create Free Account
        </LoadingButton>
      </form>

      <Divider />
      <SocialButton
        provider="Google"
        onClick={() => {
          login("alex@virulmuse.ai", "Alex Rivera");
          navigate(ROUTES.DASHBOARD);
        }}
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
