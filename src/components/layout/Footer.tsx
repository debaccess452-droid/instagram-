import React from "react";
import { Link } from "react-router-dom";
import { Logo } from "@/components/common";
import { ROUTES } from "@/constants/routes";

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-card-border bg-background-elevated/60">
      <div className="mx-auto max-w-container px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="space-y-4">
            <Logo />
            <p className="text-sm text-text-secondary leading-relaxed">
              AI content that sounds unmistakably like you. Built for creators
              scaling across Instagram, X, and LinkedIn without losing their
              authentic voice.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-text-primary mb-3">
              Product
            </h4>
            <ul className="space-y-2.5 text-sm text-text-secondary">
              <li>
                <Link to={ROUTES.GENERATE_CONTENT} className="hover:text-text-primary">
                  Content Generator
                </Link>
              </li>
              <li>
                <Link to={ROUTES.PROFILE} className="hover:text-text-primary">
                  Creator DNA Profile
                </Link>
              </li>
              <li>
                <Link to={ROUTES.ANALYTICS} className="hover:text-text-primary">
                  Creator Analytics
                </Link>
              </li>
              <li>
                <Link to={ROUTES.PRICING} className="hover:text-text-primary">
                  Pricing
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-text-primary mb-3">
              Company
            </h4>
            <ul className="space-y-2.5 text-sm text-text-secondary">
              <li>
                <Link to={ROUTES.ABOUT} className="hover:text-text-primary">
                  About Us
                </Link>
              </li>
              <li>
                <Link to={ROUTES.FAQ} className="hover:text-text-primary">
                  FAQ
                </Link>
              </li>
              <li>
                <Link to={ROUTES.CONTACT} className="hover:text-text-primary">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-text-primary mb-3">
              Legal
            </h4>
            <ul className="space-y-2.5 text-sm text-text-secondary">
              <li>
                <Link to={ROUTES.PRIVACY} className="hover:text-text-primary">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to={ROUTES.TERMS} className="hover:text-text-primary">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-card-border pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-text-muted">
          <p>© {new Date().getFullYear()} Virulmuse Inc. All rights reserved.</p>
          <p>Designed for high-growth creators worldwide.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
