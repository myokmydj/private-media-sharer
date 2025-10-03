// postcss.config.js (최종 수정안)

module.exports = {
  plugins: [
    'tailwindcss', // require()나 객체 대신, 단순 문자열 배열로 지정
    'autoprefixer',
  ],
};