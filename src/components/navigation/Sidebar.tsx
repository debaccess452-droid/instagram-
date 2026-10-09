import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Sparkles,
  FolderKanban,
  BarChart3,
  TrendingUp,
  Dna,
  CreditCard,
  Settings,
  CheckCircle2,
} from "lucide-react";
import { Logo } from "@/components/common";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/utils/cn";

const SIDEBAR_ITEMS = [
  { label: "Dashboard", href: ROUTES.DASHBOARD, icon: LayoutDashboard, end: true },
  { label: "Generate Content", href: ROUTES.GENERATE_CONTENT, icon: Sparkles },
  { label: "Latest Results", href: ROUTES.RESULTS_OVERVIEW, icon: CheckCircle2 },
  { label: "Content Library", href: ROUTES.HISTORY, icon: FolderKanban },
  { label: "Performance", href: ROUTES.PERFORMANCE, icon: TrendingUp },
  { label: "Analytics", href: ROUTES.ANALYTICS, icon: BarChart3 },
  { label: "Creator DNA", href: ROUTES.PROFILE, icon: Dna },
  { label: "Billing & Plan", href: ROUTES.BILLING, icon: CreditCard },
  { label: "Settings", href: ROUTES.SETTINGS_GENERAL, icon: Settings },
];

export const Sidebar: React.FC = () => {
  return (
    <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:border-r lg:border-card-border lg:bg-background-elevated">
      <div className="flex h-16 items-center px-6 border-b border-card-border">
        <Logo />
      </div>

      <nav className="flex-1 space-y-1 px-3 py-5" aria-label="Sidebar navigation">
        {SIDEBAR_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.href}
              to={item.href}
              end={item.end}
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

      <div className="p-4 border-t border-card-border">
        <div className="rounded-md bg-card p-3.5 border border-card-border">
          <div className="flex items-center justify-between text-xs font-medium text-text-primary mb-1.5">
            <span>Monthly Credits</span>
            <span className="text-primary">74 / 100</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-background overflow-hidden">
            <div className="h-full w-3/4 rounded-full bg-gradient-primary-trust" />
          </div>
          <p className="mt-2 text-[11px] text-text-muted">
            Creator Pro Plan · Renews Nov 1
          </p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
