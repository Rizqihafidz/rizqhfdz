import type { Config } from 'tailwindcss'
import forms from '@tailwindcss/forms'

export default {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#3BB5F5',
        accent: '#f43f5e',
        'background-light': '#f8fafc',
        'background-dark': '#101c22',
      },
      fontFamily: {
        display: ['var(--font-inter)', 'sans-serif'],
      },
    },
  },
  plugins: [forms],
} satisfies Config
