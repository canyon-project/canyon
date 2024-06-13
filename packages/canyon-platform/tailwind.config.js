/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
    './node_modules/canyon-ui-old/dist/**/*.{js,ts,jsx,tsx}',
    '../canyon-ui-old/src/**/*.{js,ts,jsx,tsx}',
    './node_modules/canyon-ui/dist/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
  corePlugins: {
    preflight: false,
  },
};
