import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AuthCard,
  AuthHeader,
  PasswordInput,
  PasswordStrength,
  LoadingButton,
} from "@/components/auth";
import { ROUTES } from "@/constants/routes";

export const ResetPassword: React.FC = () => {
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(ROUTES.LOGIN);
  };

  return (
    <AuthCard>
      <AuthHeader
        title="Set a new password"
        subtitle="Choose a strong password for your Virulmuse account."
      />
      <form onSubmit={handleSubmit} className="space-y-4">
        <PasswordInput
          label="New Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Minimum 8 characters"
          required
        />
        <PasswordStrength password={password} />
        <LoadingButton type="submit">Update Password</LoadingButton>
      </form>
    </AuthCard>
  );
};

export default ResetPassword;
