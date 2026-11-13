import { ROUTES } from "@/constants/routes";

const AUTH_AND_LANDING_PATHS = new Set<string>([
  ROUTES.HOME,
  ROUTES.WELCOME,
  ROUTES.LOGIN,
  ROUTES.SIGNUP,
  ROUTES.FORGOT_PASSWORD,
  ROUTES.RESET_PASSWORD,
  ROUTES.VERIFY_EMAIL,
  ROUTES.ACCOUNT_CREATED,
]);

export interface RedirectLocationState {
  from?:
    | string
    | {
        pathname?: string;
        search?: string;
        hash?: string;
      };
}

/**
 * Resolves a safe post-login in-app destination from router location state.
 * Defaults to ROUTES.DASHBOARD when absent, external, or pointing to an auth/landing page.
 */
export function getSafeRedirectPath(state: unknown): string {
  const typedState = state as RedirectLocationState | null | undefined;
  const from = typedState?.from;

  let candidate: string | null = null;
  if (typeof from === "string") {
    candidate = from.trim();
  } else if (from && typeof from === "object" && typeof from.pathname === "string") {
    candidate = `${from.pathname}${from.search || ""}${from.hash || ""}`.trim();
  }

  if (!candidate) {
    return ROUTES.DASHBOARD;
  }

  // Only allow safe internal paths (reject protocol-relative '//' or absolute URLs)
  if (!candidate.startsWith("/") || candidate.startsWith("//")) {
    return ROUTES.DASHBOARD;
  }

  const pathnameOnly = candidate.split(/[?#]/)[0];
  if (!pathnameOnly || AUTH_AND_LANDING_PATHS.has(pathnameOnly)) {
    return ROUTES.DASHBOARD;
  }

  return candidate;
}
