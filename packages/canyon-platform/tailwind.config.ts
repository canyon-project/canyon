import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";
import { addDynamicIconSelectors } from "@iconify/tailwind";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "../canyon-report/src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {},
  plugins: [tailwindcssAnimate, addDynamicIconSelectors({})],
} satisfies Config;
