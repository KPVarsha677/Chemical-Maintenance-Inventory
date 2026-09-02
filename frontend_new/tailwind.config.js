export default {content: [
  './index.html',
  './src/**/*.{js,ts,jsx,tsx}'
],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      colors: {
        navy: {
          50: '#f4f6fa',
          100: '#e6eaf2',
          200: '#c8d2e4',
          300: '#9aabc9',
          400: '#6a80a8',
          500: '#4b6089',
          600: '#3a4b6d',
          700: '#2c3a56',
          800: '#1b2740',
          900: '#111b30',
          950: '#0a1220',
        },
        brand: {
          50: '#eef5ff',
          100: '#d9e8ff',
          200: '#bcd7ff',
          300: '#8ebeff',
          400: '#599bff',
          500: '#3178f6',
          600: '#1d5ae3',
          700: '#1848bd',
          800: '#193e99',
          900: '#1a3779',
        },
      },
      borderRadius: {
        DEFAULT: '4px',
        md: '6px',
        lg: '8px',
      },
      boxShadow: {
        card: '0 1px 2px 0 rgba(16, 24, 40, 0.05)',
        pop: '0 12px 32px -8px rgba(10, 18, 32, 0.18), 0 2px 6px -1px rgba(10, 18, 32, 0.08)',
      },
      fontSize: {
        '2xs': ['0.6875rem', { lineHeight: '1rem' }],
      },
    },
  },
}
