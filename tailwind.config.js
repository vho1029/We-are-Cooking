/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: '#38a169',
        secondary: '#2d3748',
        accent: '#edf2f7',
        dark: '#1a202c',
        light: '#f7fafc',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        heading: ['Poppins', 'sans-serif'],
      },
      boxShadow: {
        'custom-light': '0 4px 6px rgba(0, 0, 0, 0.1)',
        'custom-dark': '0 4px 10px rgba(0, 0, 0, 0.2)',
      },
    },
  },
  plugins: [],
};
