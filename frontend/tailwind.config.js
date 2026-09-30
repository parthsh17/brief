/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Outfit', 'sans-serif'],
      },
      colors: {
        bullish: '#ef4444',
        bearish: '#f43f5e',
        neutral: '#fde047',
        surface: '#212126',
        'surface-2': '#2c2c33',
        brand: '#ef4444',
      },
      boxShadow: {
        'neo': '4px 4px 0px 0px #ffffff',
        'neo-sm': '2px 2px 0px 0px #ffffff',
        'neo-bullish': '4px 4px 0px 0px #ef4444',
        'neo-bearish': '4px 4px 0px 0px #f43f5e',
        'neo-neutral': '4px 4px 0px 0px #fde047',
        'neo-brand': '6px 6px 0px 0px #ef4444',
      },
      borderRadius: {
        DEFAULT: '0px',
        sm: '0px',
        md: '0px',
        lg: '0px',
        xl: '0px',
        '2xl': '0px',
        full: '0px',
      },
      keyframes: {
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'flicker': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        }
      },
      animation: {
        'slide-up': 'slide-up 0.5s ease-out both',
        'fade-in': 'fade-in 0.4s ease-out both',
        'flicker': 'flicker 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
