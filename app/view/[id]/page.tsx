// app/page.tsx (최종 진단 테스트용)

import type { Metadata } from 'next';

/**
 * [최종 진단용] 이 프로젝트에서 메타 태그 생성이 근본적으로 작동하는지 확인합니다.
 * 데이터베이스 조회나 어떠한 비동기 작업도 없습니다.
 */
export const metadata: Metadata = {
  title: '메인 페이지 정적 테스트 제목',
  description: '이것이 보이면, 메타 태그 생성 자체는 문제가 없습니다.',
  openGraph: {
    title: '메인 페이지 정적 테스트 제목',
    description: '이것이 보이면, 메타 태그 생성 자체는 문제가 없습니다.',
    images: [
      {
        url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/Wikipedia-logo-v2.svg/1200px-Wikipedia-logo-v2.svg.png',
        width: 1200,
        height: 1200,
        alt: 'Main Page Test Image',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '메인 페이지 정적 테스트 제목',
    description: '이것이 보이면, 메타 태그 생성 자체는 문제가 없습니다.',
    images: ['https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/Wikipedia-logo-v2.svg/1200px-Wikipedia-logo-v2.svg.png'],
  },
};

export default function HomePage() {
  return (
    <main>
      <h1>메인 페이지 테스트</h1>
      <p>이 페이지는 메타 태그 생성 기능이 정상적으로 작동하는지 확인하기 위한 최종 테스트 페이지입니다.</p>
    </main>
  );
}