// next.config.ts

import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    // remotePatterns 대신 domains를 사용합니다.
    // 여기에 Step 1에서 복사한 정확한 호스트 이름을 붙여넣으세요.
    domains: ['pub-36efcebb6f624798b7169d496005c244.r2.dev'], 
  },
};

export default nextConfig;