/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#0a0a0a",
        "ink-light": "#1a1a1a",
        secondary: "#737373",
        tertiary: "#a3a3a3",
        "accent-red": "#dc2626",
        "accent-green": "#16a34a",
        gold: "#d4af37",
        "gold-light": "#f4d03f",
      },
      fontFamily: {
        sans: ["Inter", "SF Pro Display", "system-ui", "sans-serif"],
        display: ["Inter", "SF Pro Display", "system-ui", "sans-serif"],
      },
      borderRadius: {
        card: "24px",
        button: "16px",
        chip: "9999px",
        sheet: "32px",
      },
      boxShadow: {
        soft: "0 8px 32px rgba(0,0,0,0.06)",
        "soft-lg": "0 20px 60px rgba(0,0,0,0.12)",
        glow: "0 0 40px rgba(212,175,55,0.15)",
        "glow-red": "0 0 40px rgba(220,38,38,0.12)",
        cinematic: "0 25px 80px rgba(0,0,0,0.18)",
      },
      animation: {
        "float-up": "floatUp 0.9s cubic-bezier(0.16,1,0.3,1) both",
        "float-up-slow": "floatUp 1.2s cubic-bezier(0.16,1,0.3,1) both",
        "card-in": "cardIn3d 0.8s cubic-bezier(0.16,1,0.3,1) both",
        "fade-slide": "fadeSlide 0.6s ease-out both",
        "scale-in": "scaleIn 0.5s cubic-bezier(0.34,1.56,0.64,1) both",
        shimmer: "shimmer 2s infinite",
        "pulse-ring": "pulseRing 2.5s ease-in-out infinite",
        "float-brand": "floatBrand 8s ease-in-out infinite",
        marquee: "marquee 25s linear infinite",
        "marquee-slow": "marquee 40s linear infinite",
        grain: "grain 8s steps(10) infinite",
        "holo-sweep": "holoSweep 5s ease-in-out infinite",
        spotlight: "spotlight 8s ease-in-out infinite",
        breathe: "breathe 6s ease-in-out infinite",
        "ticket-flip": "ticketFlip 0.9s cubic-bezier(0.16,1,0.3,1) both",
        "beam-spin": "beamSpin 1.5s linear infinite",
        "success-pop": "successPop 0.5s cubic-bezier(0.34,1.56,0.64,1) both",
        "count-pulse": "countPulse 0.3s ease-out",
        "slide-up": "slideUp 0.5s cubic-bezier(0.16,1,0.3,1) both",
        "light-leak": "lightLeak 12s ease-in-out infinite",
        "ambient-drift": "ambientDrift 20s ease-in-out infinite",
      },
      keyframes: {
        floatUp: {
          "0%": { opacity: "0", transform: "translateY(60px) scale(0.95)" },
          "100%": { opacity: "1", transform: "translateY(0) scale(1)" },
        },
        cardIn3d: {
          "0%": { opacity: "0", transform: "translateY(50px) rotateX(15deg)" },
          "100%": { opacity: "1", transform: "translateY(0) rotateX(0)" },
        },
        fadeSlide: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.9)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        pulseRing: {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(220,38,38,0.3)" },
          "50%": { boxShadow: "0 0 0 12px rgba(220,38,38,0)" },
        },
        floatBrand: {
          "0%, 100%": { transform: "translateY(0) rotate(-1deg)" },
          "50%": { transform: "translateY(-20px) rotate(1deg)" },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        grain: {
          "0%, 100%": { transform: "translate(0,0)" },
          "10%": { transform: "translate(-5%,-10%)" },
          "20%": { transform: "translate(-15%,5%)" },
          "30%": { transform: "translate(7%,-25%)" },
          "40%": { transform: "translate(-5%,25%)" },
          "50%": { transform: "translate(-15%,10%)" },
          "60%": { transform: "translate(15%,0%)" },
          "70%": { transform: "translate(0%,15%)" },
          "80%": { transform: "translate(3%,35%)" },
          "90%": { transform: "translate(-10%,10%)" },
        },
        holoSweep: {
          "0%, 100%": { transform: "translateX(-100%)" },
          "50%": { transform: "translateX(100%)" },
        },
        spotlight: {
          "0%, 100%": { opacity: "0.3", transform: "translate(-30%, -30%) scale(1)" },
          "50%": { opacity: "0.6", transform: "translate(30%, 30%) scale(1.2)" },
        },
        breathe: {
          "0%, 100%": { transform: "scale(1)", opacity: "0.8" },
          "50%": { transform: "scale(1.05)", opacity: "1" },
        },
        ticketFlip: {
          "0%": { opacity: "0", transform: "rotateY(-90deg)" },
          "100%": { opacity: "1", transform: "rotateY(0)" },
        },
        beamSpin: {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        successPop: {
          "0%": { transform: "scale(0) rotate(-10deg)" },
          "70%": { transform: "scale(1.2) rotate(3deg)" },
          "100%": { transform: "scale(1) rotate(0)" },
        },
        countPulse: {
          "0%": { transform: "scale(1.3)", opacity: "0.5" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(100%)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        lightLeak: {
          "0%, 100%": { opacity: "0", transform: "translateX(-100%) rotate(-5deg)" },
          "50%": { opacity: "0.08", transform: "translateX(100%) rotate(5deg)" },
        },
        ambientDrift: {
          "0%, 100%": { transform: "translate(0, 0) rotate(0deg)" },
          "33%": { transform: "translate(10px, -15px) rotate(1deg)" },
          "66%": { transform: "translate(-5px, 10px) rotate(-0.5deg)" },
        },
      },
    },
  },
  plugins: [],
};
