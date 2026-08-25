/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          300: "#93c5fd",
          400: "#60a5fa",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
          800: "#1e40af",
          900: "#1e3a8a",
        },
        navy: {
          950: "#05070f",
          900: "#080c18",
          850: "#0a1122",
          800: "#0e1830",
          700: "#152241",
          600: "#1d2f57",
        },
        ink: {
          900: "#0b1220",
          800: "#152033",
          700: "#334155",
          500: "#64748b",
          400: "#94a3b8",
        },
        line: "#e6eaf1",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
      },
      maxWidth: {
        content: "1200px",
      },
      boxShadow: {
        card: "0 1px 3px rgba(15,23,42,0.06), 0 1px 2px rgba(15,23,42,0.04)",
        "card-hover": "0 18px 40px -12px rgba(15,23,42,0.18)",
        cta: "0 10px 30px -8px rgba(37,99,235,0.55)",
      },
      keyframes: {
        floatA: {
          "0%,100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-12px)" },
        },
        floatB: {
          "0%,100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-9px)" },
        },
        floatC: {
          "0%,100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-16px)" },
        },
        /* Animates the independent `translate` property, NOT `transform`, so an
           element can carry a static `rotate:` tilt at the same time without the
           two clobbering each other — and without needing a transformed wrapper,
           which would become a backdrop root and kill the cards' backdrop-blur. */
        floatY: {
          "0%,100%": { translate: "0 0" },
          "50%": { translate: "0 -7px" },
        },
      },
      animation: {
        floatA: "floatA 6s ease-in-out infinite",
        floatB: "floatB 7.5s ease-in-out infinite",
        floatC: "floatC 8.5s ease-in-out infinite",
        floatY: "floatY 6.5s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
