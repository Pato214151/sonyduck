/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // SonYDuck Theme - Black, Gray, Red
        sonyduck: {
          // Primary Red (accent)
          red: '#E53935',
          'red-hover': '#FF5252',
          'red-dark': '#C62828',
          // Grays
          black: '#0A0A0A',
          dark: '#121212',
          medium: '#1E1E1E',
          light: '#2A2A2A',
          lighter: '#3A3A3A',
          border: '#333333',
        },
        text: {
          white: '#FFFFFF',
          light: '#B0B0B0',
          subtle: '#707070',
          muted: '#505050',
        },
        // Backward compatibility
        spotify: {
          green: '#E53935',
          'green-hover': '#FF5252',
          black: '#0A0A0A',
          dark: '#121212',
          medium: '#1E1E1E',
          light: '#2A2A2A',
          lighter: '#3A3A3A',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'shimmer': 'shimmer 2s infinite linear',
        'pulse-slow': 'pulse 3s infinite',
        'pulse-red': 'pulse-red 2s infinite',
        'bounce-glow': 'bounce-glow 1.5s infinite',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'pulse-red': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        'bounce-glow': {
          '0%, 100%': { transform: 'scale(1)', boxShadow: '0 0 10px rgba(229, 57, 53, 0.5)' },
          '50%': { transform: 'scale(1.05)', boxShadow: '0 0 20px rgba(229, 57, 53, 0.8)' },
        },
      },
      boxShadow: {
        'red-glow': '0 0 20px rgba(229, 57, 53, 0.4)',
        'red-glow-lg': '0 0 40px rgba(229, 57, 53, 0.6)',
      },
    },
  },
  plugins: [],
}
