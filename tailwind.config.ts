// tailwind.config.ts (덮어쓰기)
import type { Config } from 'tailwindcss';
import colors from 'tailwindcss/colors';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        // ▼▼▼ 기본 sans 폰트를 Freesentation으로 변경 ▼▼▼
        sans: ['Freesentation', 'sans-serif'], 
        // ▼▼▼ 본문에서 선택 가능한 폰트 목록 ▼▼▼
        pretendard: ['Pretendard', 'sans-serif'],
        bookkmyungjo: ['BookkMyungjo', 'serif'],
        freesentation: ['Freesentation', 'sans-serif'],
        paperozi: ['Paperozi', 'sans-serif'],
      },
      // ▼▼▼ Freesentation 폰트 두께를 직접 매핑 ▼▼▼
      fontWeight: {
        medium: '500',
        black: '900',
      },
    },
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      black: colors.black,
      white: colors.white,
      gray: colors.gray,
      red: colors.red,
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};
export default config;