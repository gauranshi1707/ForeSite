function withOpacityValue(variable) {
  return ({ opacityValue }) => {
    if (opacityValue === undefined) {
      return `rgb(var(${variable}))`;
    }
    return `rgb(var(${variable}) / ${opacityValue})`;
  };
}

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
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
        white: withOpacityValue('--tw-white'),
        black: withOpacityValue('--tw-black'),
        stone: {
          25: withOpacityValue('--tw-stone-25'),
          50: withOpacityValue('--tw-stone-50'),
          100: withOpacityValue('--tw-stone-100'),
          200: withOpacityValue('--tw-stone-200'),
          300: withOpacityValue('--tw-stone-300'),
          400: withOpacityValue('--tw-stone-400'),
          500: withOpacityValue('--tw-stone-500'),
          600: withOpacityValue('--tw-stone-600'),
          700: withOpacityValue('--tw-stone-700'),
          800: withOpacityValue('--tw-stone-800'),
          900: withOpacityValue('--tw-stone-900'),
        },
      }
    },
  },
  plugins: [],
}
