import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
    "./projects/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        dexter: {
          primary: "#F26B1A",
          accent: "#F23E01",
          light: "#FEFBF4",
        },
      },
      boxShadow: {
        "dexter-inner": "inset 0 0 10px rgba(24,5,0,0.25)",
      },
    },
  },
  plugins: [],
};

export default config;
