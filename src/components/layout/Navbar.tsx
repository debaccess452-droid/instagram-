import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Sparkles, ArrowRight } from "lucide-react";
import { Logo } from "@/components/common";
import { Button } from "@/components/buttons";
import { ROUTES } from "@/constants/routes";

const NAV_LINKS = [
  { label: "Features", href: "/#features" },
  { label: "How It Works", href: "/#how-it-works" },
  { label: "Creator DNA", href: "/#creator-dna" },
  { label: "Pricing", href: ROUTES.PRICING },
  { label: "FAQ", href: ROUTES.FAQ },
  { label: "Dashboard Demo", href: ROUTES.DASHBOARD },
];

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-card-border/70 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-container items-center justify-between px-4 sm:px-6 lg:px-8">
        <Logo />

        <nav className="hidden md:flex items-center gap-7" aria-label="Main navigation">
          {NAV_LINKS.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.label}
                to={item.href}
                className={`text-sm font-medium transition-colors ${
                  isActive
                    ? "text-text-primary"
                    : "text-text-secondary hover:text-text-primary"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <Link to={ROUTES.LOGIN}>
            <Button variant="ghost" size="sm">
              Log in
            </Button>
          </Link>
          <Link to={ROUTES.SIGNUP}>
            <Button
              variant="cta"
              size="sm"
              rightIcon={<ArrowRight className="h-3.5 w-3.5" />}
            >
              Start Free Trial
            </Button>
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setMobileMenuOpen((prev) => !prev)}
          aria-expanded={mobileMenuOpen}
          aria-label="Toggle navigation menu"
          className="inline-flex md:hidden items-center justify-center rounded-sm p-2 text-text-secondary hover:bg-white/5 hover:text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-t border-card-border bg-background-elevated px-4 pt-3 pb-6 space-y-3">
          {NAV_LINKS.map((item) => (
            <Link
              key={item.label}
              to={item.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block rounded-sm px-3 py-2 text-sm font-medium text-text-secondary hover:bg-white/5 hover:text-text-primary"
            >
              {item.label}
            </Link>
          ))}
          <div className="pt-3 border-t border-card-border flex flex-col gap-2.5">
            <Link to={ROUTES.LOGIN} onClick={() => setMobileMenuOpen(false)}>
              <Button variant="secondary" fullWidth size="sm">
                Log in
              </Button>
            </Link>
            <Link to={ROUTES.SIGNUP} onClick={() => setMobileMenuOpen(false)}>
              <Button
                variant="cta"
                fullWidth
                size="sm"
                leftIcon={<Sparkles className="h-4 w-4" />}
              >
                Start Free Trial
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
