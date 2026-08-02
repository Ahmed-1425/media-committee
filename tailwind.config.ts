import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        brand: {
          navy: "#06266F",
          blue: "#023793",
          lightNavy: "#0B399B",
          accent: "#1A56CE",
          surface: "#F8FAFC",
          darkSurface: "#0A1224",
          darkCard: "#111C35",
        },
      },
      fontFamily: {
        sans: ["var(--font-ibm-plex-arabic)", "IBM Plex Sans Arabic", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
