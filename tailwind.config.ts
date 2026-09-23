import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bazarna: {
          red: "#E52E2E",
          darkred: "#C51C1C",
          black: "#0A0A0A",
          charcoal: "#171717",
          sand: "#FBF9F5",
          cream: "#F3EFE6",
          gold: "#F5A623",
          green: "#00A86B",
          blue: "#1D63D8",
        },
        kiwi: {
          50: "#f4f8ed",
          100: "#e7f1d8",
          200: "#d0e4b4",
          300: "#b4d388",
          400: "#9ec466",
          500: "#8ebf42",
          600: "#719e30",
          700: "#567926",
          800: "#466023",
          900: "#3a5020",
        },
        butter: {
          50: "#fefce8",
          100: "#fef9c3",
          200: "#fef08a",
          300: "#fde047",
          400: "#facc15",
          500: "#eab308",
        },
        blush: {
          50: "#fdf2f8",
          100: "#fce7f3",
          200: "#fbcfe8",
          300: "#f9a8d4",
          400: "#f472b6",
          500: "#ec4899",
        },
        babyblue: {
          50: "#f0f9ff",
          100: "#e0f2fe",
          200: "#bae6fd",
          300: "#7dd3fc",
          400: "#38bdf8",
          500: "#0ea5e9",
        },
        obsidian: {
          DEFAULT: "#09090b",
          light: "#18181b",
          lighter: "#27272a",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-bebas)", "var(--font-outfit)", "Impact", "sans-serif"],
        script: ["var(--font-caveat)", "cursive"],
        body: ["var(--font-outfit)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        "3xl": "1.75rem",
        "4xl": "2.25rem",
      },
      boxShadow: {
        "soft-sm": "0 2px 8px -2px rgba(0, 0, 0, 0.05), 0 1px 4px -1px rgba(0, 0, 0, 0.03)",
        "soft-md": "0 6px 16px -3px rgba(0, 0, 0, 0.06), 0 2px 6px -2px rgba(0, 0, 0, 0.04)",
        "soft-lg": "0 12px 28px -5px rgba(0, 0, 0, 0.08), 0 4px 10px -3px rgba(0, 0, 0, 0.05)",
        "soft-xl": "0 20px 40px -8px rgba(0, 0, 0, 0.10), 0 6px 16px -4px rgba(0, 0, 0, 0.06)",
        "bazarna-glow": "0 8px 30px -4px rgba(229, 46, 46, 0.35)",
        "kiwi-glow": "0 8px 25px -4px rgba(142, 191, 66, 0.35)",
        "butter-glow": "0 8px 25px -4px rgba(253, 224, 71, 0.35)",
        "blush-glow": "0 8px 25px -4px rgba(251, 207, 232, 0.45)",
      },
    },
  },
  plugins: [],
};
export default config;
