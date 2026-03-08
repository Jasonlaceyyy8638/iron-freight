import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Global theme: Neon Lime (#C1FF00) + Matte Black (#0A0A0B)
        black: '#0A0A0B',
        primary: '#C1FF00',
        'primary/20': 'rgba(193, 255, 0, 0.2)',
        'primary/15': 'rgba(193, 255, 0, 0.15)',
        'primary/11': 'rgba(193, 255, 0, 0.11)',
        secondary: '#262626',
        surface: '#1A1A1A',
        background: '#0A0A0B',
        success: '#22C55E',
        'success/22': 'rgba(74, 222, 128, 0.22)',
        error: '#EF4444',
        hint: '#525252',
        divider: '#333333',
        slate: '#1A1A1A',
        lime: '#C1FF00',
        'lime/90': 'rgba(193, 255, 0, 0.9)',
        'lime/20': 'rgba(193, 255, 0, 0.2)',
        'lime/10': 'rgba(193, 255, 0, 0.1)',
        matte: '#0A0A0B',
        // Iron scale (matte-based) for dashboard/driver/login
        iron: {
          950: '#0A0A0B',
          900: '#121212',
          800: '#1A1A1A',
          700: '#262626',
          600: '#333333',
          500: '#737373',
          400: '#A3A3A3',
          300: '#D4D4D4',
          200: '#E5E5E5',
          100: '#F9FAFB',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        display: ['var(--font-space-grotesk)', 'system-ui', 'sans-serif'],
        mono: ['ui-monospace', 'monospace'],
      },
      fontSize: {
        'headline-lg': ['2rem', { lineHeight: '1.1' }],
        'headline-md': ['1.625rem', { lineHeight: '1.2' }],
        'title-lg': ['1.25rem', { lineHeight: '1.2' }],
        'title-md': ['1rem', { lineHeight: '1.4' }],
        'body-lg': ['1rem', { lineHeight: '1.5' }],
        'body-md': ['0.875rem', { lineHeight: '1.5' }],
        'body-sm': ['0.75rem', { lineHeight: '1.4' }],
        'label-lg': ['0.875rem', { lineHeight: '1.3' }],
        'label-md': ['0.75rem', { lineHeight: '1.3' }],
        'label-sm': ['0.625rem', { lineHeight: '1.2' }],
      },
      spacing: {
        xs: '4px',
        sm: '8px',
        md: '16px',
        lg: '24px',
        xl: '32px',
      },
    },
  },
  plugins: [],
}
export default config
