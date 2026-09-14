/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["\"Big Shoulders Display\"", "sans-serif"],
        sans: ["\"IBM Plex Sans\"", "sans-serif"],
      },
      colors: {
        bg: "#15110D",
        surface: "#1E1712",
        surface2: "#271E17",
        border: "rgba(255,225,190,0.10)",
        borderStrong: "rgba(255,225,190,0.20)",
        text: "#F3E9DD",
        muted: "#A89685",
        mutedDim: "#6B5D50",
        accent: "#FF7A3D",
        accentSoft: "rgba(255,122,61,0.14)",
        teal: "#5FA3C7",
      },
      boxShadow: {
        glow: "0 8px 24px -8px rgba(255,122,61,0.5)",
      },
    },
  },
  plugins: [],
};
