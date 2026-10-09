import React from "react";
import { Link } from "react-router-dom";
import { Sparkles, Bell, User } from "lucide-react";
import { Button } from "@/components/buttons";
import { ROUTES } from "@/constants/routes";
import { useAuth } from "@/hooks/useAuth";

export const Topbar: React.FC = () => {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-card-border bg-background/90 px-6 backdrop-blur-md">
      <div className="flex items-center gap-3">
        <span className="inline-flex items-center gap-1.5 rounded-sm bg-primary/15 px-2.5 py-1 text-xs font-medium text-primary border border-primary/25">
          <Sparkles className="h-3.5 w-3.5" />
          Personalization Active ({user?.dnaScore ?? 92}% match)
        </span>
      </div>

      <div className="flex items-center gap-3">
        <Link to={ROUTES.GENERATE_CONTENT}>
          <Button variant="primary" size="sm" leftIcon={<Sparkles className="h-3.5 w-3.5" />}>
            Generate Content
          </Button>
        </Link>

        <Link
          to={ROUTES.SETTINGS_NOTIFICATIONS}
          aria-label="Notifications"
          className="rounded-sm p-2 text-text-secondary hover:bg-white/5 hover:text-text-primary"
        >
          <Bell className="h-5 w-5" />
        </Link>

        <Link
          to={ROUTES.PROFILE}
          className="flex items-center gap-2.5 rounded-md border border-card-border bg-card px-3 py-1.5 text-sm font-medium text-text-primary hover:border-primary/40"
        >
          <User className="h-4 w-4 text-primary" />
          <span className="hidden sm:inline">{user?.name || "Alex Rivera"}</span>
        </Link>
      </div>
    </header>
  );
};

export default Topbar;
