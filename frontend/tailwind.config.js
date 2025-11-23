// frontend/tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Paleta HATCH
        hatch: {
          orange: '#FF6B35',
          'orange-light': '#FF8C61',
          'orange-dark': '#E65A2B',
          blue: '#2C3E50',
          'blue-light': '#34495E',
          'blue-dark': '#1A252F',
          gray: '#ECF0F1',
          'gray-dark': '#BDC3C7',
        }
      },
      backgroundImage: {
        'gradient-hatch': 'linear-gradient(135deg, #1A252F 0%, #2C3E50 100%)',
        'gradient-orange': 'linear-gradient(135deg, #FF6B35 0%, #E65A2B 100%)',
      }
    },
  },
  plugins: [],
}