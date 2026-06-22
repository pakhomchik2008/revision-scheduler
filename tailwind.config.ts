import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        bg: "#F9FAFB",
        primary: "#10B981",
        danger: "#EF4444",
        warn: "#F59E0B",
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
export default config;
