/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: { '2xl': '1400px' },
    },
    extend: {
      colors: {
        // Paper background — warm beige base, keeps the workshop tool from
        // feeling like a SaaS dashboard.
        paper: {
          DEFAULT: '#FBF9F5',
          card: '#FFFFFF',
          warm: '#F5F1E8', // slightly warmer cream for inset blocks
        },
        // Ink (text) — warm deep, not pure black.
        ink: {
          primary: '#1A2620',
          secondary: '#4A554F',
          muted: '#8B928E',
        },
        // Brand — Miracle X CI: PANTONE 5605C / #21362C
        brand: {
          DEFAULT: '#21362C',
          hover: '#15241D',
          light: '#E5EBE6', // soft sage tint for hover states / table headers
          subtle: '#F0F3F0', // even softer for striping
        },
        // Accents — gold keeps everything warm; red/green for state.
        accent: {
          red: '#7C2D2D',
          green: '#3F6B4F', // success state, slightly brighter than brand
          gold: '#A8842C', // AI / 高峰 / 重點 — warmth anchor
          goldSoft: '#D9C58A', // backgrounds / borders for accent zones
        },
        line: {
          light: '#E8E5DE', // very light warm grey
          medium: '#CFCDC5',
        },
        // shadcn shims (CSS vars) — kept for shadcn primitives
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      fontFamily: {
        serif: ['"Noto Serif TC"', 'serif'],
        sans: ['"Noto Sans TC"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}
