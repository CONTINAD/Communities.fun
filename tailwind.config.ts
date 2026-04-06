import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: "#000000",
          secondary: "#16181C",
          tertiary: "#1D1F23",
          hover: "#080808",
        },
        border: {
          primary: "#2F3336",
        },
        text: {
          primary: "#E7E9EA",
          secondary: "#71767B",
        },
        accent: {
          DEFAULT: "#1D9BF0",
          hover: "#1A8CD8",
        },
        danger: "#F4212E",
        success: "#00BA7C",
        like: "#F91880",
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          '"Segoe UI"',
          "Roboto",
          "Helvetica",
          "Arial",
          "sans-serif",
        ],
      },
      maxWidth: {
        feed: "600px",
        sidebar: "275px",
        "right-sidebar": "350px",
      },
    },
  },
  plugins: [],
};
export default config;
