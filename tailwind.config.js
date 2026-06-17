/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        "taxi-navy": "#16a34a",
        "taxi-dark-navy": "#ffffff",
        "taxi-gold": {
          light: "#86efac", // Green 300
          DEFAULT: "#16a34a", // Green 600
          dark: "#15803d", // Green 700
        },
        "taxi-white": "#ffffff",
      },
      backgroundImage: {
        "taxi-gold-gradient": "linear-gradient(to right, #4ade80, #16a34a)",
        "taxi-gold-gradient-left": "linear-gradient(to left, #4ade80, #16a34a)",
        "luxury-pattern": "none",
      },
      keyframes: {
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
      },
      animation: {
        shimmer: 'shimmer 2s infinite',
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}