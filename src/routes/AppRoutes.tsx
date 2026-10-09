import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { ROUTES } from "@/constants/routes";
import { WebsiteLayout, AuthLayout, DashboardLayout } from "@/layouts";
import { PublicRoute } from "./PublicRoute";
import { ProtectedRoute } from "./ProtectedRoute";

// Website pages
import { Landing } from "@/pages/website/Landing/Landing";
import { About } from "@/pages/website/About/About";
import { Contact } from "@/pages/website/Contact/Contact";
import { FAQ } from "@/pages/website/FAQ/FAQ";
import { Pricing } from "@/pages/website/Pricing/Pricing";
import { Privacy } from "@/pages/website/Privacy/Privacy";
import { Terms } from "@/pages/website/Terms/Terms";

// Auth pages
import { Welcome as AuthWelcome } from "@/pages/auth/Welcome/Welcome";
import { Login } from "@/pages/auth/Login/Login";
import { Signup } from "@/pages/auth/Signup/Signup";
import { ForgotPassword } from "@/pages/auth/ForgotPassword/ForgotPassword";
import { ResetPassword } from "@/pages/auth/ResetPassword/ResetPassword";
import { VerifyEmail } from "@/pages/auth/VerifyEmail/VerifyEmail";
import { AccountCreated } from "@/pages/auth/AccountCreated/AccountCreated";

// Onboarding pages
import { Welcome as OnboardingWelcome } from "@/pages/onboarding/Welcome/Welcome";
import { CreatorType } from "@/pages/onboarding/CreatorType/CreatorType";
import { Platforms } from "@/pages/onboarding/Platforms/Platforms";
import { WritingStyle } from "@/pages/onboarding/WritingStyle/WritingStyle";
import { Goals } from "@/pages/onboarding/Goals/Goals";
import { PostingFrequency } from "@/pages/onboarding/PostingFrequency/PostingFrequency";
import { AIProcessing as OnboardingAIProcessing } from "@/pages/onboarding/AIProcessing/AIProcessing";
import { Success as OnboardingSuccess } from "@/pages/onboarding/Success/Success";

// Dashboard pages
import { Home } from "@/pages/dashboard/Home/Home";
import { GenerateContent } from "@/pages/dashboard/GenerateContent/GenerateContent";
import { AIProcessing } from "@/pages/dashboard/AIProcessing/AIProcessing";
import { History } from "@/pages/dashboard/History/History";
import { Performance } from "@/pages/dashboard/Performance/Performance";
import { Analytics } from "@/pages/dashboard/Analytics/Analytics";
import { Profile } from "@/pages/dashboard/Profile/Profile";
import { Billing } from "@/pages/dashboard/Billing/Billing";
import { ResultsOverview } from "@/pages/dashboard/ResultsOverview/ResultsOverview";
import { ResultsHooks } from "@/pages/dashboard/ResultsHooks/ResultsHooks";
import { ResultsCaption } from "@/pages/dashboard/ResultsCaption/ResultsCaption";
import { ResultsCta } from "@/pages/dashboard/ResultsCta/ResultsCta";
import { ResultsHashtags } from "@/pages/dashboard/ResultsHashtags/ResultsHashtags";
import { ResultsReelScript } from "@/pages/dashboard/ResultsReelScript/ResultsReelScript";
import { ResultsThreads } from "@/pages/dashboard/ResultsThreads/ResultsThreads";

// Settings pages
import { General } from "@/pages/settings/General/General";
import { Account } from "@/pages/settings/Account/Account";
import { Security } from "@/pages/settings/Security/Security";
import { Notifications } from "@/pages/settings/Notifications/Notifications";
import { Appearance } from "@/pages/settings/Appearance/Appearance";

// Errors
import { NotFound } from "@/pages/errors/NotFound/NotFound";

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Landing has its own Navbar/Footer composition */}
      <Route path={ROUTES.HOME} element={<Landing />} />

      {/* Public Website pages */}
      <Route element={<WebsiteLayout />}>
        <Route path={ROUTES.ABOUT} element={<About />} />
        <Route path={ROUTES.CONTACT} element={<Contact />} />
        <Route path={ROUTES.FAQ} element={<FAQ />} />
        <Route path={ROUTES.PRICING} element={<Pricing />} />
        <Route path={ROUTES.PRIVACY} element={<Privacy />} />
        <Route path={ROUTES.TERMS} element={<Terms />} />
      </Route>

      {/* Auth pages */}
      <Route element={<PublicRoute />}>
        <Route element={<AuthLayout />}>
          <Route path={ROUTES.WELCOME} element={<AuthWelcome />} />
          <Route path={ROUTES.LOGIN} element={<Login />} />
          <Route path={ROUTES.SIGNUP} element={<Signup />} />
          <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPassword />} />
          <Route path={ROUTES.RESET_PASSWORD} element={<ResetPassword />} />
          <Route path={ROUTES.VERIFY_EMAIL} element={<VerifyEmail />} />
          <Route path={ROUTES.ACCOUNT_CREATED} element={<AccountCreated />} />
        </Route>
      </Route>

      {/* Protected Onboarding, Dashboard & Settings */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          {/* Onboarding */}
          <Route
            path={ROUTES.ONBOARDING}
            element={<Navigate to={ROUTES.ONBOARDING_WELCOME} replace />}
          />
          <Route path={ROUTES.ONBOARDING_WELCOME} element={<OnboardingWelcome />} />
          <Route path={ROUTES.ONBOARDING_CREATOR_TYPE} element={<CreatorType />} />
          <Route path={ROUTES.ONBOARDING_PLATFORMS} element={<Platforms />} />
          <Route path={ROUTES.ONBOARDING_WRITING_STYLE} element={<WritingStyle />} />
          <Route path={ROUTES.ONBOARDING_GOALS} element={<Goals />} />
          <Route path={ROUTES.ONBOARDING_POSTING_FREQUENCY} element={<PostingFrequency />} />
          <Route path={ROUTES.ONBOARDING_AI_PROCESSING} element={<OnboardingAIProcessing />} />
          <Route path={ROUTES.ONBOARDING_SUCCESS} element={<OnboardingSuccess />} />

          {/* Dashboard */}
          <Route path={ROUTES.DASHBOARD} element={<Home />} />
          <Route path={ROUTES.GENERATE_CONTENT} element={<GenerateContent />} />
          <Route path={ROUTES.AI_PROCESSING} element={<AIProcessing />} />
          <Route path={ROUTES.HISTORY} element={<History />} />
          <Route path={ROUTES.PERFORMANCE} element={<Performance />} />
          <Route path={ROUTES.ANALYTICS} element={<Analytics />} />
          <Route path={ROUTES.PROFILE} element={<Profile />} />
          <Route path={ROUTES.BILLING} element={<Billing />} />

          {/* Results */}
          <Route path={ROUTES.RESULTS_OVERVIEW} element={<ResultsOverview />} />
          <Route path={ROUTES.RESULTS_HOOKS} element={<ResultsHooks />} />
          <Route path={ROUTES.RESULTS_CAPTION} element={<ResultsCaption />} />
          <Route path={ROUTES.RESULTS_REEL_SCRIPT} element={<ResultsReelScript />} />
          <Route path={ROUTES.RESULTS_THREADS} element={<ResultsThreads />} />
          <Route path={ROUTES.RESULTS_HASHTAGS} element={<ResultsHashtags />} />
          <Route path={ROUTES.RESULTS_CTA} element={<ResultsCta />} />

          {/* Settings */}
          <Route
            path={ROUTES.SETTINGS}
            element={<Navigate to={ROUTES.SETTINGS_GENERAL} replace />}
          />
          <Route path={ROUTES.SETTINGS_GENERAL} element={<General />} />
          <Route path={ROUTES.SETTINGS_ACCOUNT} element={<Account />} />
          <Route path={ROUTES.SETTINGS_SECURITY} element={<Security />} />
          <Route path={ROUTES.SETTINGS_NOTIFICATIONS} element={<Notifications />} />
          <Route path={ROUTES.SETTINGS_APPEARANCE} element={<Appearance />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
