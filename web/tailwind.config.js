/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: "class",
  theme: {
    extend: {
      // ── Stitch MD3 Design Tokens ──────────────────────────────
      colors: {
        // MD3 Primary (deep navy)
        primary: "#002045",
        "on-primary": "#ffffff",
        "primary-container": "#1a365d",
        "on-primary-container": "#86a0cd",
        "primary-fixed": "#d6e3ff",
        "primary-fixed-dim": "#adc7f7",
        "on-primary-fixed": "#001b3c",
        "on-primary-fixed-variant": "#2d476f",
        "inverse-primary": "#adc7f7",

        // MD3 Secondary (orange — CTAs, accents)
        secondary: "#904d00",
        "on-secondary": "#ffffff",
        "secondary-container": "#fe932c",
        "on-secondary-container": "#663500",
        "secondary-fixed": "#ffdcc3",
        "secondary-fixed-dim": "#ffb77d",
        "on-secondary-fixed": "#2f1500",
        "on-secondary-fixed-variant": "#6e3900",

        // MD3 Tertiary
        tertiary: "#132233",
        "on-tertiary": "#ffffff",
        "tertiary-container": "#29374a",
        "on-tertiary-container": "#92a0b7",
        "tertiary-fixed": "#d5e3fc",
        "tertiary-fixed-dim": "#b9c7df",
        "on-tertiary-fixed": "#0d1c2e",
        "on-tertiary-fixed-variant": "#3a485b",

        // MD3 Surface system (light mode)
        surface: "#f7f9fb",
        "surface-dim": "#d8dadc",
        "surface-bright": "#f7f9fb",
        "surface-container-lowest": "#ffffff",
        "surface-container-low": "#f2f4f6",
        "surface-container": "#eceef0",
        "surface-container-high": "#e6e8ea",
        "surface-container-highest": "#e0e3e5",
        "surface-variant": "#e0e3e5",
        "surface-tint": "#455f88",
        background: "#f7f9fb",

        // MD3 On-surface
        "on-surface": "#191c1e",
        "on-surface-variant": "#43474e",
        "on-background": "#191c1e",
        "inverse-surface": "#2d3133",
        "inverse-on-surface": "#eff1f3",

        // MD3 Outline
        outline: "#74777f",
        "outline-variant": "#c4c6cf",

        // MD3 Error
        error: "#ba1a1a",
        "on-error": "#ffffff",
        "error-container": "#ffdad6",
        "on-error-container": "#93000a",

        // Semantic success (green — stock disponible, statut livré)
        success: "#4A7C59",
        "on-success": "#ffffff",

        // Logo Foga-Tech accents (charte alignée logo)
        "logo-blue": "#234998",
        "logo-blue-light": "#4A7BC8",
        "logo-gray": "#A8A8A8",
      },

      // ── Typography ───────────────────────────────────────────
      fontFamily: {
        headline: ["Manrope", "sans-serif"],
        body: ["Inter", "sans-serif"],
        label: ["Manrope", "sans-serif"],
        sans: ["Inter", "sans-serif"],
      },

      // ── Border Radius (flat/architectural) ───────────────────
      borderRadius: {
        DEFAULT: "0.125rem", // 2px
        sm: "0.125rem",
        md: "0.125rem",
        lg: "0.25rem", // 4px
        xl: "0.5rem", // 8px
        "2xl": "0.75rem", // 12px
        full: "9999px",
      },

      // ── 8px-grid spacing tokens ─────────────────────────────
      spacing: {
        // Échelle nommée canonique (multiples de 8, sauf xxs=4)
        xxs: "var(--space-xxs)", // 4
        xs:  "var(--space-xs)",  // 8
        s:   "var(--space-s)",   // 16
        m:   "var(--space-m)",   // 24
        l:   "var(--space-l)",   // 32
        xl:  "var(--space-xl)",  // 48
        xxl: "var(--space-xxl)", // 64
        // Composés sections (fluid, multiples de 8)
        "section-large": "var(--section-space-large)",
        "section-main":  "var(--section-space-main)",
        "section-small": "var(--section-space-small)",
        global:          "var(--padding-global)",
      },

      // ── Shadows ───────────────────────────────────────────────
      boxShadow: {
        tectonic: "0 24px 48px -12px rgba(25, 28, 30, 0.06)",
        "tectonic-lg": "0 24px 40px -10px rgba(25, 28, 30, 0.10)",
        card: "0 4px 16px rgba(25, 28, 30, 0.06)",
        "tectonic-sm": "0 4px 12px rgba(25, 28, 30, 0.04)",
        "tectonic-orange": "0 4px 24px rgba(254, 147, 44, 0.25)",
        "tectonic-inset": "inset 0 1px 0 rgba(255,255,255,0.08)",
      },
    },
  },
  plugins: [],
};
