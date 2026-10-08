# Virulmuse

AI content-generation SaaS for creators. This repo follows the structure
defined in the project's Project Structure document and Product Roadmap.

## Structure

See `docs/PROJECT_STRUCTURE.md` for the full folder tree. In short:

- `src/pages/website` — public marketing site (Landing is fully built; the
  rest are placeholders — see "Build status" below)
- `src/pages/auth` — Welcome, Login, and Signup are real, built pages
  (Phase 4A); ForgotPassword is still a placeholder (Phase 4B)
- `src/pages/onboarding`, `src/pages/dashboard`, `src/pages/settings` —
  placeholder pages only, not yet built
- `src/components` — shared UI, grouped by type (buttons, cards, forms,
  navigation, layout, modal, auth, charts) and by domain (onboarding,
  dashboard). Built so far: `Button`, `Logo`, `Navbar`, `Footer`, `Topbar`,
  `Card`, `Input`, `Modal`, `Sidebar`, `Breadcrumb`, `PageHeader`,
  `SectionTitle`, `Loader`, `EmptyState`, `ErrorState`, `PagePlaceholder`
  (which composes `PageHeader` + `Card` + `EmptyState`), and — new in
  Phase 4A — `components/auth/`: `AuthBackground`, `AuthCard`,
  `AuthHeader`, `AuthFooter`, `PasswordInput`, `SocialButton`, `Divider`,
  `PasswordStrength`, `FormField`, `Checkbox`, `LoadingButton`,
  `FormMessage`. `charts/`, `onboarding/`, and `dashboard/` are still
  empty — those are feature-specific components for later phases.
- `src/app/App.tsx` — composition root; renders `<AppRoutes />`
- `src/routes/` — the actual route table (`AppRoutes.tsx`) plus
  `PublicRoute`/`ProtectedRoute` guards. Guards are backed by a placeholder
  `useAuth` hook (`src/hooks/useAuth.ts`) that's always "logged out" until
  the real auth module is built — so `onboarding/`, `dashboard/`, and
  `settings/` routes currently redirect to Login, which is expected.
- `src/layouts/` — shared page chrome: `WebsiteLayout` (Navbar+Footer, used
  by `website/*` except Landing, which already composes its own),
  `AuthLayout` (centered shell for `auth/*`), `DashboardLayout` (sidebar
  shell for `dashboard/*` and `settings/*`)
- `src/context/AppProviders.tsx` — single composition point for app-wide
  providers (currently wires up `ThemeProvider` only — no other providers
  were defined in the uploaded materials)
- `src/styles` — global CSS and design tokens
- `src/types/` — shared structural TypeScript types
- `src/constants/routes.ts` — central route path constants

Path aliases (`@`, `@components`, `@pages`, `@routes`, `@layouts`, `@types`,
etc. → `src/...`) are configured in both `vite.config.ts` and
`tsconfig.json`.

## Build status

The **Landing page** (`src/pages/website/Landing`) and the **auth module's
Welcome, Login, and Signup pages** (`src/pages/auth/{Welcome,Login,Signup}`)
are real, finished implementations. Login and Signup have working
client-side validation, a loading state, and a UI-only success state —
there is no backend, so nothing is actually authenticated or created.

Every other page in the project structure — including `ForgotPassword`,
which is explicitly out of scope until Phase 4B — exists only as a
placeholder (`src/components/common/PagePlaceholder.tsx`), each with a
page-specific title and one-line description, so that routing resolves
and the project compiles end-to-end. Building out any of those pages'
real content is a separate, future task.

## Running it

```bash
npm install
npm run dev       # start the dev server
npm run build     # type-check + production build
npm run preview   # preview the production build
```

## Design decisions worth knowing about
*(carried over from the original Landing module's README)*

- **Signature element:** the hero doesn't use a static dashboard screenshot.
  It shows a small looping demo — a rough idea typed on one side, and
  Virulmuse's generated version typing out on the other, cycling through
  Instagram/X/LinkedIn examples.
- **"DNA" terminology:** `DashboardShowcase.tsx` uses **"Personalization"**
  instead of "DNA Learning Progress" — this substitution was made in that
  one component only; the uploaded materials don't state whether the rule
  applies more broadly (see the Roadmap's Risks section).
- **Numbered steps** are used only in `HowItWorks.tsx`, intentionally not
  in `Features.tsx`.
- **Accessibility:** all interactive elements have visible focus states,
  icon-only buttons have `aria-label`s, the mobile menu and FAQ accordion
  expose `aria-expanded`, and all animation respects
  `prefers-reduced-motion` globally via `src/styles/index.css`.
- **Design tokens** (`src/styles/tokens.ts`, `tailwind.config.ts`): exact
  type scale, spacing scale, radius, and shadow values are production
  defaults chosen to satisfy the brief's qualitative requirements — treat
  as provisional until a dedicated Design System task confirms them.

## Known gaps

- `public/logo.svg` and `public/favicon.ico` are referenced by the project
  structure but were not provided in any upload and were not fabricated —
  add real brand assets here when available.
- No state-management, data-fetching, or real auth pattern is defined yet;
  `src/data`, `src/lib`, `src/services` are scaffolded but intentionally
  empty, and `src/hooks/useAuth.ts` is a placeholder (always returns
  `isAuthenticated: false`) until the auth module is built.
- The auth module (`AuthBackground`, `AuthCard`, etc.) uses its own darker
  color palette (`#09090B` background, `#18181B` cards) straight from the
  Phase 4 Authentication Design System doc, applied via Tailwind arbitrary
  values rather than new global tokens — intentionally scoped to `auth/`
  rather than changing `tailwind.config.ts`'s `background`/`card` colors
  used everywhere else. Reconcile the two palettes if that was meant to be
  one unified system.
