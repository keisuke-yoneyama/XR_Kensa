/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/features/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        steel: {
          50: "#f4f7f9",
          100: "#dde7ed",
          300: "#8fa8b8",
          500: "#4f6b7b",
          700: "#324855",
          900: "#1c2a33"
        }
      }
    }
  },
  plugins: []
};