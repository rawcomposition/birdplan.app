module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./modals/**/*.{js,ts,jsx,tsx}",
    "./providers/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        accent: "#fdbf05",
        dark: "#1e263a",
      },
      container: {
        center: true,
      },
      boxShadow: {
        left: "0 -5px 25px -5px rgba(0, 0, 0, 0.15)",
      },
    },
    fontFamily: {
      body: ["Ubuntu", "sans-serif"],
      logo: ["Lobster", "cursive"],
    },
    screens: {
      xs: "480px",
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
