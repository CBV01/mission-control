import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Surfaces — driven by CSS variables, switchable at runtime via theme
        'bg-root': 'rgb(var(--bg-root) / <alpha-value>)',
        'bg-surface': 'rgb(var(--bg-surface) / <alpha-value>)',
        'bg-elevated': 'rgb(var(--bg-elevated) / <alpha-value>)',
        'bg-glass': 'rgb(var(--bg-elevated) / 0.7)',

        // Text
        'text-primary': 'rgb(var(--text-primary) / <alpha-value>)',
        'text-secondary': 'rgb(var(--text-secondary) / <alpha-value>)',
        'text-tertiary': 'rgb(var(--text-tertiary) / <alpha-value>)',
        'text-accent': '#67e8f9',

        // Borders — very subtle
        'border-subtle': 'rgba(255, 255, 255, 0.06)',
        'border-default': 'rgba(255, 255, 255, 0.08)',
        'border-strong': 'rgba(255, 255, 255, 0.14)',

        // Accents — keep purple/cyan/violet
        'accent-cyan': '#06b6d4',
        'accent-violet': '#8b5cf6',
        'accent-magenta': '#d946ef',

        // Status
        'status-success': '#10b981',
        'status-warning': '#f59e0b',
        'status-danger': '#ef4444',
        'status-info': '#3b82f6',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
        display: ['Geist', 'Inter', 'sans-serif'],
      },
      fontSize: {
        '2xs': ['11px', { lineHeight: '1rem' }],
      },
      backgroundImage: {
        'gradient-accent': 'linear-gradient(135deg, #06b6d4 0%, #8b5cf6 50%, #d946ef 100%)',
        'gradient-cyan': 'linear-gradient(135deg, #06b6d4 0%, #8b5cf6 100%)',
        'dot-grid':
          'radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px)',
      },
      backgroundSize: {
        'dot-grid': '24px 24px',
      },
      boxShadow: {
        'glow-cyan': '0 0 20px rgba(6, 182, 212, 0.25)',
        'glow-violet': '0 0 20px rgba(139, 92, 246, 0.25)',
        'glow-magenta': '0 0 20px rgba(217, 70, 239, 0.25)',
        'glow-success': '0 0 20px rgba(16, 185, 129, 0.25)',
        'glow-warning': '0 0 20px rgba(245, 158, 11, 0.25)',
        'glow-danger': '0 0 20px rgba(239, 68, 68, 0.25)',
        'inner-top': 'inset 0 1px 0 0 rgba(255, 255, 255, 0.05)',
      },
      animation: {
        'pulse-slow': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'pulse-glow': 'pulse-glow 1.5s ease-in-out infinite',
        'shimmer': 'shimmer 1.8s linear infinite',
        'fade-in': 'fade-in 150ms ease-out',
        'zoom-in-95': 'zoom-in-95 150ms ease-out',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { opacity: '1', boxShadow: '0 0 20px rgba(6, 182, 212, 0.4)' },
          '50%': { opacity: '0.7', boxShadow: '0 0 30px rgba(6, 182, 212, 0.6)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'zoom-in-95': {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      transitionTimingFunction: {
        'ease-out-expo': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      zIndex: {
        'base': '10',
        'dropdown': '20',
        'sticky': '30',
        'modal': '40',
        'popover': '50',
        'toast': '60',
        'fab': '50',
      },
    },
  },
  plugins: [],
};

export default config;
