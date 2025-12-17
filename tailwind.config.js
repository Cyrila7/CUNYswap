/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        'times-new-roman': ['"Times New Roman"', 'Times', 'serif'],
      },
    },
  },
  plugins: [],
}

