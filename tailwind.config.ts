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
    // ▼▼▼ extend 대신 colors를 직접 정의하여 덮어씁니다 ▼▼▼
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      black: colors.black,
      white: colors.white,
      gray: colors.gray,
      // 에러 메시지 등을 위해 red 색상은 유지합니다.
      red: colors.red,
    },
    // ▲▲▲ 여기까지 수정 ▲▲▲
    extend: {
      fontFamily: {
        pretendard: ['Pretendard', 'sans-serif'],
        bookkmyungjo: ['BookkMyungjo', 'serif'],
        freesentation: ['Freesentation', 'sans-serif'],
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};
export default config;