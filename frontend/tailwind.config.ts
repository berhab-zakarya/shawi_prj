import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx}', // عدل المسارات حسب مشروعك
  ],
  theme: {
    extend: {
      keyframes: {
        'bg-position': {
          '0%': { backgroundPosition: '0% 50%' },
          '100%': { backgroundPosition: '100% 50%' },
        },
      },
      animation: {
        'bg-move': 'bg-position 5s ease-in-out infinite', // مثال على استخدام الـ keyframes
      },
    },
  },
  plugins: [],
}

export default config
