module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./modals/**/*.{js,ts,jsx,tsx}",
    "./providers/**/*.{js,ts,jsx,tsx}",
    "./icons/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
    fontFamily: {
      body: ["Ubuntu", "sans-serif"],
      logo: ["Lobster", "cursive"],
    },
    screens: {
      xs: "480px",
      sm: "640px",
      md: "768px",
    },
  },
  plugins: [],
};
