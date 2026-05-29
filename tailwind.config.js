/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "primary": "#001e41",
        "primary-container": "#17335a",
        "on-primary": "#ffffff",
        "surface": "#f6fafe",
        "background": "#f6fafe",
        "outline-variant": "#c3c6d1",
      },
      fontFamily: {
        "headline": ["Manrope", "sans-serif"],
        "body": ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
}
