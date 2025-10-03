// next.config.ts

import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    domains: ['pub-36efcebb6f624798b7169d496005c244.r2.dev'], 
  },
  // ▼▼▼ 아래 내용을 추가해주세요 ▼▼▼
  experimental: {
    outputFileTracingIncludes: {
      '/api/og': ['./public/fonts/**/*.otf'],
    },
  },
  // ▲▲▲ 여기까지 추가 ▲▲▲
};

export default nextConfig;