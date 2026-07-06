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
        ink: "#20242a",
        slate: "#3f4a56",
        navy: "#17375e",
        "navy-soft": "#214a76",
        buff: "#d9c6a3",
        "buff-light": "#e6d8b8",
        "buff-soft": "#f3ead8",
        bone: "#fbfaf6",
        muted: "#5c6672",
        sage: "#71806f",
        brass: "#8a6f43",
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
