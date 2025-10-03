// postcss.config.js (수정된 버전)

module.exports = {
  plugins: {
    'tailwindcss/postcss': {}, // 'tailwindcss' 대신 더 구체적인 경로로 변경
    autoprefixer: {},
  },
};