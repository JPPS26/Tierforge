/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["Sora", "sans-serif"],
        sans: ["Inter", "sans-serif"],
      },
      colors: {
        bg: "#09090D",
        surface: "#121218",
        surface2: "#191922",
        border: "rgba(255,255,255,0.08)",
        borderStrong: "rgba(255,255,255,0.14)",
        text: "#F1F1F5",
        muted: "#8D8D9B",
        mutedDim: "#5F5F6D",
        accent: "#7C5CFF",
        accentSoft: "rgba(124,92,255,0.15)",
        teal: "#31D8A8",
      },
      boxShadow: {
        glow: "0 8px 24px -8px rgba(124,92,255,0.55)",
      },
    },
  },
  plugins: [],
};
