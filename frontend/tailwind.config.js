/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        // Keep warm stone grays as main palette
        stone: {
          25: '#fdfcfb',
          50: '#faf9f7',
        }
      }
    },
  },
  plugins: [],
}
