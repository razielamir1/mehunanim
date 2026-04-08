/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Rubik', 'system-ui', 'sans-serif'],
        display: ['"Varela Round"', 'Rubik', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#f5f3ff',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
        },
      },
      keyframes: {
        pop: { '0%,100%': { transform: 'scale(1)' }, '50%': { transform: 'scale(1.08)' } },
        shake: { '0%,100%': { transform: 'translateX(0)' }, '25%': { transform: 'translateX(-6px)' }, '75%': { transform: 'translateX(6px)' } },
        float: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-8px)' } },
      },
      animation: {
        pop: 'pop 0.4s ease-out',
        shake: 'shake 0.4s ease-in-out',
        float: 'float 3s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
