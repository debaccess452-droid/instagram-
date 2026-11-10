import React, { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Sparkles, Bell, User, Menu, X } from "lucide-react";
import { Button } from "@/components/buttons";
import { Logo } from "@/components/common";
import { ROUTES } from "@/constants/routes";
import { useAuth } from "@/hooks/useAuth";
import { SIDEBAR_ITEMS } from "@/components/navigation/Sidebar";
import { cn } from "@/utils/cn";

export const Topbar: React.FC = () => {
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-card-border bg-background/90 px-4 sm:px-6 backdrop-blur-md">
        <div className="flex items-center gap-3">
          {/* Mobile Menu Hamburger */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="lg:hidden p-2 rounded-md text-text-secondary hover:text-text-primary hover:bg-white/5"
            aria-label="Open navigation menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          <span className="hidden sm:inline-flex items-center gap-1.5 rounded-sm bg-primary/15 px-2.5 py-1 text-xs font-medium text-primary border border-primary/25">
            <Sparkles className="h-3.5 w-3.5" />
            Personalization Active ({user?.dnaScore ?? 92}% match)
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Link to={ROUTES.GENERATE_CONTENT}>
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Sparkles className="h-3.5 w-3.5" />}
              className="text-xs sm:text-sm py-1.5 sm:py-2"
            >
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

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden bg-black/80 backdrop-blur-sm animate-auth-fade-in">
          <div className="relative w-72 max-w-[85vw] h-full bg-background-elevated border-r border-card-border flex flex-col p-5 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-card-border">
              <Logo />
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 rounded-md text-text-secondary hover:text-text-primary hover:bg-white/5"
                aria-label="Close navigation menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="flex-1 space-y-1 py-4 overflow-y-auto" aria-label="Mobile navigation">
              {SIDEBAR_ITEMS.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.href}
                    to={item.href}
                    end={item.end}
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center gap-3 rounded-md px-3.5 py-2.5 text-sm font-medium transition-colors",
                        isActive
                          ? "bg-primary/15 text-text-primary border border-primary/30"
                          : "text-text-secondary hover:bg-white/5 hover:text-text-primary"
                      )
                    }
                  >
                    <Icon className="h-4 w-4 text-primary" />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </nav>

            <div className="pt-3 border-t border-card-border">
              <div className="rounded-md bg-card p-3 border border-card-border text-xs">
                <div className="flex items-center justify-between text-text-primary font-medium mb-1">
                  <span>Monthly Credits</span>
                  <span className="text-primary">74 / 100</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-background overflow-hidden">
                  <div className="h-full w-3/4 rounded-full bg-gradient-primary-trust" />
                </div>
              </div>
            </div>
          </div>

          <div
            className="flex-1"
            onClick={() => setMobileMenuOpen(false)}
          />
        </div>
      )}
    </>
  );
};

export default Topbar;
