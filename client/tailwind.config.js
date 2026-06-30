/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Warm, distinctive startup palette. Deep teal accent + warm cream surfaces.
        // Replaces the generic indigo/violet that screams "AI default".
        accent: {
          50:  '#eefcf6',
          100: '#d4f6e7',
          200: '#a9ecd0',
          300: '#74dbb5',
          400: '#3fc497',
          500: '#1ea97c',
          600: '#138a66',
          700: '#106d53',
          800: '#0f5645',
          900: '#0d4739',
          950: '#062821',
        },
        cream: {
          50:  '#fbf8f2',
          100: '#f6efdf',
          200: '#ecdcb6',
        },
        ink: {
          900: '#0e1b1a',
          800: '#1a2a28',
          700: '#2a3a37',
        },
        // Keep "primary" alias for legacy classes
        primary: {
          50:  '#eefcf6',
          100: '#d4f6e7',
          500: '#1ea97c',
          600: '#138a66',
          700: '#106d53',
        }
      },
      fontFamily: {
        display: ['Fraunces', 'ui-serif', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      boxShadow: {
        'ambient': '0 1px 3px rgba(14, 27, 26, 0.06), 0 1px 2px rgba(14, 27, 26, 0.04)',
        'lift':    '0 12px 28px -8px rgba(14, 27, 26, 0.14), 0 4px 10px -4px rgba(14, 27, 26, 0.08)',
        'glow':    '0 0 0 3px rgba(30, 169, 124, 0.18)',
      },
      transitionTimingFunction: {
        'out-quart': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      keyframes: {
        'fade-up': {
          '0%':   { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'pop-in': {
          '0%':   { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'shimmer': {
          '0%':   { backgroundPosition: '-400px 0' },
          '100%': { backgroundPosition: '400px 0' },
        },
        'idle-float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':      { transform: 'translateY(-6px)' },
        },
        'slide-in-right': {
          '0%':   { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
      },
      animation: {
        'fade-up':    'fade-up 350ms cubic-bezier(0.16, 1, 0.3, 1) both',
        'fade-in':    'fade-in 250ms ease-out both',
        'pop-in':     'pop-in 250ms cubic-bezier(0.16, 1, 0.3, 1) both',
        'shimmer':    'shimmer 1.6s linear infinite',
        'idle-float': 'idle-float 3s ease-in-out infinite',
        'slide-in-right': 'slide-in-right 250ms cubic-bezier(0.16, 1, 0.3, 1) both',
      },
    },
  },
  plugins: [],
}
