/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: "#0B1220",
          light: "#131C2E",
          deep: "#060A12",
        },
        charcoal: {
          DEFAULT: "#171B21",
          light: "#22262E",
        },
        medical: {
          white: "#F4F6F9",
          mist: "#E8ECF1",
        },
        gold: {
          400: "#C89B3C",
          500: "#D4AF37",
          600: "#B8860B",
        },
        cyan: {
          soft: "#6FD8E8",
        },
        emerald: {
          accent: "#2ECC91",
        },
        frost: "rgba(244, 246, 249, 0.06)",
      },
      fontFamily: {
        display: ["Cinzel", "serif"],
        serif2: ["Cormorant Garamond", "serif"],
        body: ["Inter", "sans-serif"],
        data: ["Manrope", "sans-serif"],
      },
      backdropBlur: {
        xs: "2px",
      },
      boxShadow: {
        gold: "0 0 30px -5px rgba(212, 175, 55, 0.35)",
        cyan: "0 0 30px -5px rgba(111, 216, 232, 0.35)",
        glass: "0 8px 32px rgba(0, 0, 0, 0.35)",
      },
      keyframes: {
        pulseGlow: {
          "0%, 100%": { opacity: 0.5, boxShadow: "0 0 0px rgba(212,175,55,0)" },
          "50%": { opacity: 1, boxShadow: "0 0 24px rgba(212,175,55,0.55)" },
        },
        driftSlow: {
          "0%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
          "100%": { transform: "translateY(0px)" },
        },
      },
      animation: {
        pulseGlow: "pulseGlow 2.4s ease-in-out infinite",
        driftSlow: "driftSlow 6s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
