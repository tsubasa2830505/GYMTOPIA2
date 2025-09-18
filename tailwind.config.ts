import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      fontFamily: {
        'hiragino': ['Hiragino Kaku Gothic ProN', 'sans-serif'],
        'inter': ['Inter', 'sans-serif'],
      },
      colors: {
        'accent': 'var(--gt-primary)',
        'accent-strong': 'var(--gt-primary-strong)',
        'accent-secondary': 'var(--gt-secondary)',
        'background': 'var(--gt-background)',
        'background-strong': 'var(--gt-background-strong)',
        'surface': 'rgba(255, 255, 255, 0.98)',
        'surface-muted': 'rgba(254, 255, 250, 0.94)',
        'text-main': 'var(--gt-text-main)',
        'text-muted': 'var(--gt-text-muted)'
      },
      boxShadow: {
        'custom': '0 18px 38px -24px rgba(189, 101, 78, 0.28)',
        'custom-sm': '0 12px 26px -20px rgba(189, 101, 78, 0.22)',
        'custom-lg': '0 28px 60px -26px rgba(189, 101, 78, 0.32)',
      },
      borderRadius: {
        'custom': '14px',
        'custom-lg': '21px',
      }
    },
  },
  plugins: [],
};
export default config;
