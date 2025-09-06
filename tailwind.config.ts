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
        'indigo': {
          500: '#6366f1',
          900: '#312e81',
        },
        'violet': {
          200: '#ddd6fe',
        },
        'slate': {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          600: '#475569',
          900: '#0f172a',
        }
      },
      boxShadow: {
        'custom': '0px 10px 15px -3px rgba(0,0,0,0.1), 0px 4px 6px -4px rgba(0,0,0,0.1)',
        'custom-sm': '0px 1px 3px 0px rgba(0,0,0,0.1), 0px 1px 2px -1px rgba(0,0,0,0.1)',
        'custom-lg': '0px 25px 50px -12px rgba(0,0,0,0.25)',
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
