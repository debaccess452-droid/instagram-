import React, { useState } from "react";
import { User, Mail, Shield, LogOut, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/buttons";
import { Card } from "@/components/cards";

export const Account: React.FC = () => {
  const { user, supabaseUser, logout } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      await logout();
    } catch (err) {
      console.error("Sign out error:", err);
      setLoggingOut(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Account Settings</h1>
        <p className="text-sm text-text-secondary mt-1">
          Manage your authenticated Supabase identity and workspace credentials.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Profile Identity Card */}
        <Card padding="md" className="space-y-4">
          <div className="flex items-center justify-between border-b border-card-border pb-3">
            <h2 className="text-base font-semibold text-text-primary flex items-center gap-2">
              <User className="h-4 w-4 text-primary" />
              Authenticated Profile
            </h2>
            <span className="inline-flex items-center gap-1 rounded-full bg-success/15 px-2.5 py-0.5 text-xs font-medium text-success border border-success/30">
              <CheckCircle2 className="h-3 w-3" />
              Active Session
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="rounded-lg bg-background-elevated p-3 border border-card-border">
              <span className="text-[10px] text-text-muted uppercase font-semibold">Display Name</span>
              <p className="text-sm font-semibold text-text-primary mt-1">
                {user?.name || "Creator"}
              </p>
            </div>

            <div className="rounded-lg bg-background-elevated p-3 border border-card-border">
              <span className="text-[10px] text-text-muted uppercase font-semibold">Email Address</span>
              <p className="text-sm font-semibold text-text-primary mt-1 flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-text-muted" />
                {user?.email || supabaseUser?.email || "No email"}
              </p>
            </div>

            <div className="rounded-lg bg-background-elevated p-3 border border-card-border">
              <span className="text-[10px] text-text-muted uppercase font-semibold">Supabase User ID</span>
              <p className="font-mono text-xs text-text-secondary mt-1 truncate">
                {supabaseUser?.id || user?.id || "N/A"}
              </p>
            </div>

            <div className="rounded-lg bg-background-elevated p-3 border border-card-border">
              <span className="text-[10px] text-text-muted uppercase font-semibold">Plan Level</span>
              <p className="text-sm font-semibold text-primary mt-1">
                {user?.plan || "Creator Pro"}
              </p>
            </div>
          </div>
        </Card>

        {/* Security & Session Actions */}
        <Card padding="md" className="space-y-4">
          <div className="flex items-center justify-between border-b border-card-border pb-3">
            <h2 className="text-base font-semibold text-text-primary flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" />
              Session & Security
            </h2>
          </div>

          <p className="text-xs text-text-secondary">
            Authentication is secured via official Supabase Auth JWT sessions with automatic token refresh.
          </p>

          <div className="pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              disabled={loggingOut}
              leftIcon={<LogOut className="h-4 w-4 text-error" />}
              className="text-error hover:bg-error/10 hover:border-error/40"
            >
              {loggingOut ? "Signing Out..." : "Sign Out of Virulmuse"}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Account;
