/** @type {import('tailwindcss').Config} */
module.exports = {
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
        },
      },
    },
  },
  plugins: [],
}
