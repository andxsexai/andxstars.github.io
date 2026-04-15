/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        /* Stitch v6.0 — Synthetic Entropy */
        background: '#0e0e0e',
        primary: '#d394ff',
        'primary-dim': '#aa30fa',
        secondary: '#ff68a7',
        tertiary: '#bf81ff',
        surface: {
          DEFAULT: '#131313',
          container: {
            low: '#131313',
            high: '#1f1f1f'
          }
        },
        on: {
          surface: {
            variant: '#ababab'
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
