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
      },
      container: {
        center: true,
      },
      boxShadow: {
        left: "0 -20px 25px -5px rgba(0, 0, 0, 0.3)",
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
  plugins: [],
};
