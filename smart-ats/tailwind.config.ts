import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "background": "#f9f9fc",
        "error": "#ba1a1a",
        "error-container": "#ffdad6",
        "inverse-on-surface": "#f0f0f3",
        "inverse-primary": "#95d1ce",
        "inverse-surface": "#2f3133",
        "on-background": "#1a1c1e",
        "on-error": "#ffffff",
        "on-error-container": "#93000a",
        "on-primary": "#ffffff",
        "on-primary-container": "#7ebab7",
        "on-primary-fixed": "#00201f",
        "on-primary-fixed-variant": "#084f4d",
        "on-secondary": "#ffffff",
        "on-secondary-container": "#536867",
        "on-secondary-fixed": "#091f1e",
        "on-secondary-fixed-variant": "#354b49",
        "on-surface": "#1a1c1e",
        "on-surface-variant": "#3f4948",
        "on-tertiary": "#ffffff",
        "on-tertiary-container": "#e1a181",
        "on-tertiary-fixed": "#341100",
        "on-tertiary-fixed-variant": "#693b22",
        "outline": "#707978",
        "outline-variant": "#bfc8c7",
        "primary": "#003331",
        "primary-container": "#004b49",
        "primary-fixed": "#b1eeea",
        "primary-fixed-dim": "#95d1ce",
        "secondary": "#4d6261",
        "secondary-container": "#cfe7e5",
        "secondary-fixed": "#cfe7e5",
        "secondary-fixed-dim": "#b4cbc9",
        "surface": "#f9f9fc",
        "surface-bright": "#f9f9fc",
        "surface-container": "#eeeef0",
        "surface-container-high": "#e8e8ea",
        "surface-container-highest": "#e2e2e5",
        "surface-container-low": "#f3f3f6",
        "surface-container-lowest": "#ffffff",
        "surface-dim": "#dadadc",
        "surface-tint": "#2a6865",
        "surface-variant": "#e2e2e5",
        "tertiary": "#49220a",
        "tertiary-container": "#64371e",
        "tertiary-fixed": "#ffdbcb",
        "tertiary-fixed-dim": "#fab896"
      },
      fontFamily: {
        "headline": ["var(--font-noto-serif)", "serif"],
        "body": ["var(--font-manrope)", "sans-serif"],
        "label": ["var(--font-manrope)", "sans-serif"]
      },
      borderRadius: {
        "DEFAULT": "0.125rem",
        "lg": "0.25rem",
        "xl": "0.5rem",
        "full": "0.75rem"
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out forwards',
      }
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms'),
    require('@tailwindcss/container-queries'),
  ],
};

export default config;
