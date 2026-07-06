import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#18212f",
        slate: "#334155",
        navy: "#0f2742",
        "navy-soft": "#173a5f",
        parchment: "#f7f3ea",
        bone: "#fbfaf7",
        muted: "#5b6676",
        sage: "#71806f",
        brass: "#9b7b4f",
      },
      fontFamily: {
        serif: ["Georgia", "Cambria", "\"Times New Roman\"", "Times", "serif"],
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 24px 80px rgba(15, 39, 66, 0.08)",
      },
    },
  },
  plugins: [],
};

export default config;
