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
        sans: ['Freesentation', 'sans-serif'], 
        pretendard: ['Pretendard', 'sans-serif'],
        bookkmyungjo: ['BookkMyungjo', 'serif'],
        freesentation: ['Freesentation', 'sans-serif'],
        paperozi: ['Paperozi', 'sans-serif'],
        // ▼▼▼ UI 개편을 위한 폰트 추가 ▼▼▼
        mono: ['Roboto Mono', 'monospace'],
        serif: ['Nanum Myeongjo', 'serif'],
      },
      fontWeight: {
        medium: '500',
        black: '900',
      },
      // ▼▼▼ UI 개편을 위한 색상 추가 ▼▼▼
      colors: {
        brand: {
          red: '#FF4848',
          blue: '#4A8CFF',
        }
      }
    },
    // ▼▼▼ 기본 색상 팔레트 정리 ▼▼▼
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      black: colors.black,
      white: colors.white,
      gray: colors.neutral, // 좀 더 부드러운 회색 계열로 변경
      red: colors.red,
      blue: colors.blue,
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};
export default config;