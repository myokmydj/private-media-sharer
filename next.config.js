// next.config.js (최종 완성)

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['pub-36efcebb6f624798b7169d496005c244.r2.dev'],
  },
};

// withNextIntl 플러그인을 완전히 제거합니다. 이것이 모든 문제의 시작이었습니다.
module.exports = nextConfig;