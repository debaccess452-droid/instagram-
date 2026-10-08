import type { Config } from "tailwindcss";

const config: Config = {
  // .jsx/.js added during integration so Tailwind's JIT scans the
  // copied-as-is Creator DNA module (src/modules/creator-dna/**, .jsx)
  // for utility classes — it previously only scanned .ts/.tsx.
  content: ["./src/**/*.{ts,tsx,js,jsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "#0F172A",
        "background-elevated": "#141B2E",
        card: "#1E293B",
        "card-border": "#2A3648",
        primary: {
          DEFAULT: "#7C3AED",
          hover: "#6D28D9",
        },
        trust: "#2563EB",
        cta: {
          DEFAULT: "#F97316",
          hover: "#EA6A0C",
        },
        success: "#22C55E",
        warning: "#F59E0B",
        error: "#EF4444",
        "text-primary": "#F8FAFC",
        "text-secondary": "#94A3B8",
        "text-muted": "#64748B",

        // --- Dashboard module tokens (added during integration) ---
        // These are only used by src/modules/content-generation/**.
        // Where the module's original token name collided with a
        // pre-existing key above (background, card, text-primary/
        // secondary/muted), it's added here under a "dm"/module-scoped
        // name instead, and only the module's own files were updated to
        // reference the new name — no existing key's value was changed,
        // and no other part of the app uses these.
        dmBackground: "#09090B",
        dmCard: { DEFAULT: "#18181B", elevated: "#202024" },
        dmText: { primary: "#FAFAFA", secondary: "#A1A1AA", muted: "#71717A" },
        section: "#111113",
        line: { DEFAULT: "#27272A", hover: "#3F3F46" },
        info: "#3B82F6",
        aiPurple: {
          DEFAULT: "#7C3AED",
          soft: "rgba(124, 58, 237, 0.35)",
          glow: "rgba(124, 58, 237, 0.30)",
        },
        trustBlue: { DEFAULT: "#2563EB", glow: "rgba(37, 99, 235, 0.30)" },
        convOrange: { DEFAULT: "#F97316" },
        // "light" added during integration for the Creator DNA module
        // (src/modules/creator-dna/**); DEFAULT is unchanged.
        growthGreen: { DEFAULT: "#22C55E", light: "#4ade80" },
        warnAmber: { DEFAULT: "#F59E0B" },
        dangerRed: { DEFAULT: "#EF4444" },
        darkNavy: "#0F172A",
        slateCard: "#1E293B",
        slateCardGlass: "rgba(30, 41, 59, 0.65)",
        premiumSlate: "#243447",
        slateGray: "#64748B",
        slateGrayMuted: "#334155",
        textHeading: "#FFFFFF",
        textBody: "#CBD5E1",
        textCaption: "#94A3B8",

        // --- Creator DNA module tokens (added during integration) ---
        // These are only used by src/modules/creator-dna/**. The source
        // module's own "aiPurple"/"trustBlue" keys collided with the
        // pre-existing keys above (same name, different shades), so
        // they're added here under "dna"-prefixed names instead — no
        // existing key's value was changed. "navy", "conversionOrange",
        // and "warningAmber" are new keys (no collision) and are added
        // directly under the module's original names.
        navy: {
          950: "#05070d",
          900: "#0a0e18",
          800: "#0d1220",
          700: "#131a2c",
          600: "#1a2338",
          500: "#232d47",
        },
        dnaAiPurple: { DEFAULT: "#8b5cf6", light: "#a78bfa", dark: "#7c3aed" },
        dnaTrustBlue: { DEFAULT: "#3b82f6", light: "#60a5fa" },
        conversionOrange: { DEFAULT: "#f97316" },
        warningAmber: { DEFAULT: "#f59e0b" },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      borderRadius: {
        sm: "8px",
        md: "12px",
        lg: "20px",
        // Dashboard module token (added during integration)
        xl2: "1.25rem",
      },
      boxShadow: {
        soft: "0 4px 24px -8px rgba(0,0,0,0.35)",
        card: "0 8px 32px -12px rgba(0,0,0,0.45)",
        "glow-primary":
          "0 0 0 1px rgba(124,58,237,0.25), 0 8px 40px -8px rgba(124,58,237,0.35)",
        "glow-cta": "0 8px 32px -8px rgba(249,115,22,0.45)",
        // Dashboard module tokens (added during integration). "card" was
        // renamed to "dm-card" because the module's original shadow-card
        // value differs from the existing "card" shadow above; only the
        // module's own files reference "dm-card".
        "glow-purple": "0 0 24px rgba(124, 58, 237, 0.35)",
        "glow-blue": "0 0 24px rgba(37, 99, 235, 0.30)",
        "card-lg": "0 20px 50px rgba(0, 0, 0, 0.45)",
        "dm-card": "0 4px 24px rgba(0, 0, 0, 0.35)",
        // Creator DNA module tokens (added during integration)
        glass: "0 8px 32px 0 rgba(0, 0, 0, 0.45)",
        glow: "0 0 40px -8px rgba(139, 92, 246, 0.55)",
      },
      backgroundImage: {
        "gradient-primary-trust":
          "linear-gradient(135deg, #7C3AED 0%, #2563EB 100%)",
        "gradient-radial-hero":
          "radial-gradient(60% 60% at 50% 0%, rgba(124,58,237,0.18) 0%, rgba(15,23,42,0) 70%)",
        // Dashboard module tokens (added during integration)
        "brand-gradient": "linear-gradient(135deg, #7C3AED 0%, #2563EB 100%)",
        "gradient-primary": "linear-gradient(135deg, #7C3AED, #A855F7)",
        // Creator DNA module tokens (added during integration)
        "navy-gradient":
          "radial-gradient(ellipse 120% 80% at 50% -10%, #1a2338 0%, #05070d 55%)",
        "purple-glow": "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)",
      },
      maxWidth: {
        container: "1200px",
      },
      keyframes: {
        "auth-fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "auth-slide-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "auth-pop": {
          "0%": { opacity: "0", transform: "scale(0.7)" },
          "60%": { opacity: "1", transform: "scale(1.05)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        // Creator DNA module tokens (added during integration)
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        popIn: {
          "0%": { opacity: "0", transform: "scale(0.85)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-400px 0" },
          "100%": { backgroundPosition: "400px 0" },
        },
      },
      animation: {
        "auth-fade-in": "auth-fade-in 300ms ease-out both",
        "auth-slide-up": "auth-slide-up 400ms ease-out both",
        "auth-pop": "auth-pop 500ms cubic-bezier(0.34, 1.56, 0.64, 1) both",
        // Creator DNA module tokens (added during integration)
        fadeInUp: "fadeInUp 0.5s ease forwards",
        popIn: "popIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
        shimmer: "shimmer 2s infinite linear",
      },
    },
  },
  plugins: [],
};

export default config;
