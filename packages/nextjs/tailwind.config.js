import { nextui } from "@nextui-org/react";


/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./utils/**/*.{js,ts,jsx,tsx},",
    "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  plugins: [require("daisyui"), nextui()],
  darkTheme: "dark",
  darkMode: ["selector", "[data-theme='dark']"],
  // DaisyUI theme colors
  daisyui: {
    themes: [
      {
        light: {
          primary: "#FFAA00", // orange
          "primary-content": "#030712", //grey 950
          secondary: "#F10849", // red-pinkish
          "secondary-content": "#e5e7eb", //grey 800
          accent: "#FFAA00", //orange
          "accent-content": "#030712", //grey 950
          neutral: "#4b5563", // grey 600
          "neutral-content": "#ffffff", //white
          "base-100": "#E6E6E6", // less less white
          "base-200": "#F5F5F5", // less white
          "base-300": "#ffffff", // white
          "base-content": "#000000", //black
          info: "#93BBFB",
          success: "#34EEB6",
          warning: "#FFCF72",
          error: "#FF8863",

          "--rounded-btn": "9999rem",

          ".tooltip": {
            "--tooltip-tail": "6px",
          },
          ".link": {
            textUnderlineOffset: "2px",
          },
          ".link:hover": {
            opacity: "80%",
          },
        },
      },
      {
        dark: {
          primary: "#FFAA00", // orange
          "primary-content": "#f9fafb", //grey 50
          secondary: "#F10849", // red-pinkish
          "secondary-content": "#e5e7eb", //grey 200
          accent: "#FFAA00", // orange
          "accent-content": "#f9fafb", //grey 50
          neutral: "#F9FBFF", // grey 600
          "neutral-content": "#000000", //black
          "base-100": "#2A2A2A", //less less back
          "base-200": "#131313", //less black
          "base-300": "#000000", //black
          "base-content": "#ffffff", //white
          info: "#385183",
          success: "#34EEB6",
          warning: "#FFCF72",
          error: "#FF8863",

          "--rounded-btn": "9999rem",

          ".tooltip": {
            "--tooltip-tail": "6px",
            "--tooltip-color": "oklch(var(--p))",
          },
          ".link": {
            textUnderlineOffset: "2px",
          },
          ".link:hover": {
            opacity: "80%",
          },
        },
      },
    ],
  },
  theme: {
    extend: {
      boxShadow: {
        center: "0 0 12px -2px rgb(0 0 0 / 0.05)",
      },
      animation: {
        "pulse-fast": "pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
    },
  },
};