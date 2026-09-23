/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: { 950: "#0b0c0f", 900: "#121419", 800: "#1a1d24", 700: "#262a33", 500: "#6b7280", 300: "#b8bec9" },
        gold: { 300: "#f3d98b", 400: "#e8c35a", 500: "#d4a72c" },
        flame: { 400: "#ff6b4a", 500: "#f2542d" },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
      },
    },
  },
  plugins: [],
};
