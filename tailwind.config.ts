import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef4fb",
          100: "#d9e6f5",
          200: "#b3cceb",
          300: "#84abdb",
          400: "#5385c7",
          500: "#3366ad",
          600: "#1f4e8f",
          700: "#1a3f73",
          800: "#173458",
          900: "#132a45",
        },
        teal: {
          50: "#effcf9",
          100: "#c9f5ec",
          200: "#98e9db",
          300: "#5fd6c4",
          400: "#31baa8",
          500: "#199e8f",
          600: "#0f7d73",
          700: "#12645d",
          800: "#134f4b",
          900: "#13423f",
        },
        saffron: {
          50: "#fff7ed",
          100: "#ffedd5",
          400: "#fb923c",
          500: "#f97316",
          600: "#ea580c",
        },
      },
      fontFamily: {
        sans: [
          "var(--font-inter)",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
      },
      boxShadow: {
        card: "0 1px 2px rgba(16,24,40,0.04), 0 1px 3px rgba(16,24,40,0.06)",
        cardhover: "0 4px 12px rgba(16,24,40,0.08), 0 2px 4px rgba(16,24,40,0.06)",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(4px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.3s ease-out",
      },
    },
  },
  plugins: [],
};

export default config;
