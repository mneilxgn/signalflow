/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        buy: '#22c55e',
        sell: '#ef4444',
        neutral: '#94a3b8',
      }
    },
  },
  plugins: [],
}
