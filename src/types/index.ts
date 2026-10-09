import type { ReactNode } from "react";

export interface NavItem {
  label: string;
  href: string;
  icon?: ReactNode;
  badge?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  handle?: string;
  avatarUrl?: string;
  niche?: string;
  dnaScore?: number;
  plan?: "Free" | "Creator Pro" | "Studio";
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
}
