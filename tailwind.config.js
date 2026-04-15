/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: '#0e0e0e',
        primary: '#bf00ff',
        secondary: '#d394ff',
        surface: {
          DEFAULT: '#161616',
          container: {
            low: '#121018'
          }
        },
        on: {
          surface: {
            variant: 'rgba(232, 224, 240, 0.65)'
          }
        }
      },
      fontFamily: {
        headline: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        body: ['Manrope', 'system-ui', 'sans-serif']
      }
    }
  },
  plugins: []
};
