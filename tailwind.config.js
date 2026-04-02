/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.js'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#d394ff',
        secondary: '#ff68a7',
        tertiary: '#bf81ff',
        background: '#0e0e0e',
        surface: '#1f1f1f',
        'surface-container-low': '#131313',
        'on-surface-variant': '#ababab'
      },
      fontFamily: {
        headline: ['Space Grotesk', 'sans-serif'],
        body: ['Manrope', 'sans-serif']
      }
    }
  },
  plugins: []
};
