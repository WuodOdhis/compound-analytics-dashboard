/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        compound: {
          blue: '#00D4FF',
          purple: '#7B3FE4',
          dark: '#0A0A0A',
          gray: '#1A1A1A',
        },
      },
    },
  },
  plugins: [],
}
