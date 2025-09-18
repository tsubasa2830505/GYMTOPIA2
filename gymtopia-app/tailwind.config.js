/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--gt-background)",
        'background-strong': "var(--gt-background-strong)",
        foreground: "var(--gt-text-main)",
        surface: "var(--gt-surface)",
        'surface-muted': "var(--gt-surface-muted)",
        'surface-strong': "var(--gt-surface-strong)",
        accent: "var(--gt-primary)",
        'accent-strong': "var(--gt-primary-strong)",
        'accent-soft': "var(--gt-primary-soft)",
        'accent-secondary': "var(--gt-secondary)",
        'accent-tertiary': "var(--gt-tertiary)",
        text: "var(--gt-text-main)",
        'text-subtle': "var(--gt-text-sub)",
        'text-muted': "var(--gt-text-muted)",
        'text-inverse': "var(--gt-text-inverse)",
      },
      gradientColorStops: {
        accent: "var(--gt-primary)",
        'accent-strong': "var(--gt-primary-strong)",
        'accent-soft': "rgba(231, 103, 76, 0.32)",
        'accent-secondary': "var(--gt-secondary)",
        'accent-tertiary': "var(--gt-tertiary)",
        base: "var(--gt-background)",
        'base-strong': "var(--gt-background-strong)",
      },
      fontFamily: {
        jp: ['var(--font-jp)'],
        latin: ['var(--font-latin)'],
      },
      keyframes: {
        'pulse-once': {
          '0%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.8', transform: 'scale(1.02)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'slide-up': {
          from: { transform: 'translateY(100%)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
        'scale-in': {
          from: { transform: 'scale(0.95)', opacity: '0' },
          to: { transform: 'scale(1)', opacity: '1' },
        },
        fadeIn: {
          from: { opacity: '0', transform: 'translateY(-10px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'pulse-once': 'pulse-once 0.5s ease-in-out',
        'slide-up': 'slide-up 0.3s ease-out',
        'scale-in': 'scale-in 0.2s ease-out',
        'fadeIn': 'fadeIn 0.3s ease-in-out',
      },
    },
  },
  plugins: [],
}
