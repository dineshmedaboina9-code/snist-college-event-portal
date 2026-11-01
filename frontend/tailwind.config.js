/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        lilac: '#F8F8F9',
        darkblue: {
          DEFAULT: '#111439',
          50: '#eef0fb',
          100: '#d7dbf6',
          200: '#b4bcee',
          300: '#8694e2',
          400: '#5c6bd5',
          500: '#3d4dc6',
          600: '#2d3ba8',
          700: '#232e85',
          800: '#1c2466',
          900: '#111439',
          950: '#0a0c24',
        },
        stripe: {
          purple: '#635BFF',
          cyan: '#00D4FF',
          pink: '#FF3B8A',
          indigo: '#4F46E5',
          slate: '#425466'
        }
      },
      backgroundImage: {
        'stripe-gradient': 'linear-gradient(135deg, #635BFF 0%, #00D4FF 50%, #FF3B8A 100%)',
        'stripe-subtle': 'linear-gradient(120deg, #111439 0%, #1e1b4b 60%, #312e81 100%)',
        'stripe-mesh': 'radial-gradient(at 0% 0%, rgba(99, 91, 255, 0.25) 0px, transparent 50%), radial-gradient(at 100% 0%, rgba(0, 212, 255, 0.2) 0px, transparent 50%), radial-gradient(at 50% 100%, rgba(255, 59, 138, 0.15) 0px, transparent 50%)',
        'card-gradient': 'linear-gradient(180deg, rgba(255,255,255,0.9) 0%, rgba(248,248,249,0.95) 100%)'
      }
    },
  },
  plugins: [],
}
