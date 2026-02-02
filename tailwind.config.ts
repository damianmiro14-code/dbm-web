import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#1E3A5F",
          hover: "#162B46",
          soft: "#EFF6FF",
        },
        accent: {
          DEFAULT: "#F97316",
          hover: "#EA580C",
          soft: "#FFF7ED",
        },
        section: "#F8FAFC",
        border: "#E2E8F0",
      },
    },
  },
  plugins: [],
};

export default config;
