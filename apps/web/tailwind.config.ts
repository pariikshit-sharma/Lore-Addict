import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "../../packages/ui/src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "rgb(var(--color-ink) / <alpha-value>)",
        "ink-raised": "rgb(var(--color-ink-raised) / <alpha-value>)",
        plum: "rgb(var(--color-plum) / <alpha-value>)",
        "plum-bright": "rgb(var(--color-plum-bright) / <alpha-value>)",
        "plum-deep": "rgb(var(--color-plum-deep) / <alpha-value>)",
        star: "rgb(var(--color-star) / <alpha-value>)",
        paper: "rgb(var(--color-paper) / <alpha-value>)",
        mute: "rgb(var(--color-mute) / <alpha-value>)",
        danger: "rgb(var(--color-danger) / <alpha-value>)",
      },
      fontFamily: {
        display: ["var(--font-display)"],
        body: ["var(--font-body)"],
        mono: ["var(--font-mono)"],
      },
      borderRadius: {
        bubble: "var(--radius-bubble)",
      },
      maxWidth: {
        prose: "68ch", // article body measure, per the design plan
      },
      transitionTimingFunction: {
        signature: "var(--motion-ease)",
      },
      keyframes: {
        "star-reveal": {
          "0%": { clipPath: "circle(0% at 50% 50%)", opacity: "0" },
          "100%": { clipPath: "circle(150% at 50% 50%)", opacity: "1" },
        },
        "hero-rise": {
          "0%": { transform: "translateY(12px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
      animation: {
        "star-reveal": "star-reveal 0.5s var(--motion-ease) forwards",
        "hero-rise": "hero-rise 0.6s var(--motion-ease) forwards",
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};

export default config;
