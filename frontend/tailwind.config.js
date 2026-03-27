/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        'ac-bg': '#0d1117',
        'ac-surface': '#161b27',
        'ac-card': '#1e2538',
        'ac-border': '#2d3650',
        'ac-text': '#e8e0d0',
        'ac-muted': '#8892aa',
        'ac-gold': '#c9a84c',
        'ac-gold-light': '#e8c96e',
        'ac-gold-dark': '#a07830',
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
