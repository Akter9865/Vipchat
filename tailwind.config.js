/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        gold: {
          50: '#fffbf0',
          100: '#fef5d6',
          200: '#fde7a8',
          300: '#fbd472',
          400: '#f8bd3c',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
        vip: {
          dark: '#0e0e11',
          card: '#16161c',
          cardHover: '#1e1e26',
          border: '#2a2a38',
          gold: '#dfb75c',
          goldLight: '#f3d382',
          goldDark: '#b88d33',
          whatsapp: '#00a884',
          whatsappDark: '#0b141a',
          whatsappLight: '#eefeec',
          whatsappBubbleMe: '#d9fdd3',
          whatsappBubbleOther: '#ffffff',
          whatsappBg: '#efeae2',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'gold-glow': '0 0 25px rgba(223, 183, 92, 0.35)',
        'gold-glow-lg': '0 0 45px rgba(223, 183, 92, 0.55)',
      }
    },
  },
  plugins: [],
}
