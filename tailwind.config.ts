// tailwind.config.ts

import type { Config } from 'tailwindcss';
import colors from 'tailwindcss/colors'; // tailwindcss colors import

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      black: colors.black,
      white: colors.white,
      gray: colors.gray,
      red: colors.red,
    },
    extend: {
      fontFamily: {
        pretendard: ['Pretendard', 'sans-serif'],
        bookkmyungjo: ['BookkMyungjo', 'serif'],
        freesentation: ['Freesentation', 'sans-serif'],
        // ▼▼▼ 여기에 Paperozi 폰트를 추가합니다 ▼▼▼
        paperozi: ['Paperozi', 'sans-serif'],
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};
export default config;