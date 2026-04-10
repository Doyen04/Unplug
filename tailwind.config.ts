import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#FF5C35',
          light: '#FFF0EC',
          dark: '#C93A1A',
        },
        bg: {
          base: '#FAFAF7',
          surface: '#FFFFFF',
          muted: '#F4F3EE',
          subtle: '#EEEDE6',
        },
        text: {
          primary: '#1A1A17',
          secondary: '#6B6960',
          muted: '#A9A79E',
          inverse: '#FFFFFF',
        },
        danger: {
          DEFAULT: '#E53434',
          light: '#FEF0F0',
        },
        warning: {
          DEFAULT: '#E8860A',
          light: '#FEF6EC',
        },
        success: {
          DEFAULT: '#1C9E5B',
          light: '#EDFAF3',
        },
        border: {
          DEFAULT: '#E8E7E0',
          strong: '#D0CFC7',
        },
      },
      fontFamily: {
        display: ['Playfair Display', 'Georgia', 'serif'],
        ui: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        card: '16px',
        btn: '10px',
        pill: '9999px',
        tag: '8px',
      },
      boxShadow: {
        card: '0 1px 4px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)',
        'card-hover':
          '0 2px 8px rgba(0,0,0,0.08), 0 8px 24px rgba(0,0,0,0.06)',
      },
      animation: {
        'fade-up':
          'fadeUp 0.35s cubic-bezier(0.34,1.56,0.64,1) forwards',
        'dot-bounce': 'dotBounce 1.4s infinite ease-in-out both',
        shimmer: 'shimmer 1.8s linear infinite',
      },
      keyframes: {
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        dotBounce: {
          '0%, 80%, 100%': { transform: 'scale(0)' },
          '40%': { transform: 'scale(1)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      transitionTimingFunction: {
        entrance: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        smooth: 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [],
};

export default config;
