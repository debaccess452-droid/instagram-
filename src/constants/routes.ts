export const ROUTES = {
  // Marketing / Website
  HOME: "/",
  LANDING: "/",
  PRICING: "/pricing",
  ABOUT: "/about",
  CONTACT: "/contact",
  FAQ: "/faq",
  PRIVACY: "/privacy",
  TERMS: "/terms",

  // Auth
  WELCOME: "/welcome",
  LOGIN: "/login",
  SIGNUP: "/signup",
  FORGOT_PASSWORD: "/forgot-password",
  RESET_PASSWORD: "/reset-password",
  VERIFY_EMAIL: "/verify-email",
  ACCOUNT_CREATED: "/account-created",

  // Onboarding
  ONBOARDING: "/onboarding",
  ONBOARDING_WELCOME: "/onboarding/welcome",
  ONBOARDING_CREATOR_TYPE: "/onboarding/creator-type",
  ONBOARDING_PLATFORMS: "/onboarding/platforms",
  ONBOARDING_WRITING_STYLE: "/onboarding/writing-style",
  ONBOARDING_GOALS: "/onboarding/goals",
  ONBOARDING_POSTING_FREQUENCY: "/onboarding/posting-frequency",
  ONBOARDING_AI_PROCESSING: "/onboarding/ai-processing",
  ONBOARDING_SUCCESS: "/onboarding/success",

  // Dashboard
  DASHBOARD: "/dashboard",
  DASHBOARD_HOME: "/dashboard",
  GENERATE_CONTENT: "/dashboard/generate",
  AI_PROCESSING: "/dashboard/ai-processing",
  HISTORY: "/dashboard/history",
  LIBRARY: "/dashboard/history",
  PERFORMANCE: "/dashboard/performance",
  ANALYTICS: "/dashboard/analytics",
  PROFILE: "/dashboard/profile",
  CREATOR_DNA: "/dashboard/profile",
  BILLING: "/dashboard/billing",

  // Results
  RESULTS_OVERVIEW: "/dashboard/results",
  RESULTS_HOOKS: "/dashboard/results/hooks",
  RESULTS_CAPTION: "/dashboard/results/caption",
  RESULTS_REEL_SCRIPT: "/dashboard/results/reel-script",
  RESULTS_THREADS: "/dashboard/results/threads",
  RESULTS_HASHTAGS: "/dashboard/results/hashtags",
  RESULTS_CTA: "/dashboard/results/cta",

  // Settings
  SETTINGS: "/settings",
  SETTINGS_GENERAL: "/settings/general",
  SETTINGS_ACCOUNT: "/settings/account",
  SETTINGS_SECURITY: "/settings/security",
  SETTINGS_NOTIFICATIONS: "/settings/notifications",
  SETTINGS_APPEARANCE: "/settings/appearance",
} as const;

export type RouteKey = keyof typeof ROUTES;
export type RoutePath = (typeof ROUTES)[RouteKey];
export default ROUTES;
