/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          orange: '#FF6000',
          'orange-light': '#FF8533',
          'orange-dark': '#CC4D00',
          navy: '#170453',
          'navy-light': '#1E0A6E',
        },
      },
    },
  },
  plugins: [],
}
