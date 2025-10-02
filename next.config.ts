import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // --- 👇 이 부분을 추가해주세요 ---
  images: {
    remotePatterns: [
      {
        protocol: 'https' as const, // TypeScript에서는 'as const'를 붙여주는 것이 좋습니다.
        hostname: '*.r2.cloudflarestorage.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  // --- 👆 여기까지 추가 ---
};

export default nextConfig;
