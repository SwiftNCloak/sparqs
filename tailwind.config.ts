import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        themeOrange: {
          100: "#FAB143",
          200: "#F9B44F",
          300: "#FAB14354",
        },
        textWhite: "#F0F0F0",
      },
    },
  },
  plugins: [],
};
export default config;
