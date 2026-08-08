import type { Config } from "tailwindcss";

/**
 * All colors reference CSS variables defined in src/styles/tokens.css.
 * No hardcoded colors in components.
 */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        void: "rgb(var(--c-void) / <alpha-value>)",
        abyss: "rgb(var(--c-abyss) / <alpha-value>)",
        smoke: "rgb(var(--c-smoke) / <alpha-value>)",
        veil: "rgb(var(--c-veil) / <alpha-value>)",
        pearl: "rgb(var(--c-pearl) / <alpha-value>)",
        mist: "rgb(var(--c-mist) / <alpha-value>)",
        iris: "rgb(var(--c-iris) / <alpha-value>)",
        lavender: "rgb(var(--c-lavender) / <alpha-value>)",
        aqua: "rgb(var(--c-aqua) / <alpha-value>)",
        coral: "rgb(var(--c-coral) / <alpha-value>)",
        danger: "rgb(var(--c-danger) / <alpha-value>)"
      },
      fontFamily: {
        sans: ["var(--font-sans)"],
        display: ["var(--font-display)"]
      },
      borderRadius: {
        card: "var(--radius-card)",
        pill: "var(--radius-pill)"
      },
      minHeight: { touch: "44px" },
      minWidth: { touch: "44px" }
    }
  },
  plugins: []
} satisfies Config;
