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
        background: "#111714",
        sidebarBg: "#1a211d",
        borderColor: "#29382f",
        board: "#000000",
        price: "#9eb7a8",
        inputPanel: "#0a0f0a",
        borderline: "#22C55E1A",
        tokenSelector: "#38e07b",
        modal: "#000000",
        // Kaleido green palette
        'kaleido-green': {
          light: '#00ff99',
          DEFAULT: '#00ff6e',
          dark: '#22c55e',
          darker: '#2fa05e',
          darkest: '#0a140a',
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'kaleido-dark': 'linear-gradient(to bottom right, #1a2f1a, #0d1b0d, #0a140a)',
      },
    },
  },
  plugins: [],
}
