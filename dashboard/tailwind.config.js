/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0f0f17',
        surface: '#16161f',
        border: 'rgba(255,255,255,0.08)',
        violet: {
          DEFAULT: '#7c3aed',
          light: '#9f67fa',
        },
        indigo: {
          DEFAULT: '#6366f1',
          light: '#818cf8',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
};
