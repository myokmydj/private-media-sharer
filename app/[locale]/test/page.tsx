// app/[locale]/test/page.tsx

import { getTranslations } from 'next-intl/server';

// 이 페이지는 오직 하나의 목적을 가집니다:
// getTranslations가 성공하는지 증명하는 것.
export default async function TestPage() {
  const t = await getTranslations('HomePage'); // 가장 간단한 번역 네임스페이스 사용

  return (
    <div style={{ padding: '50px', backgroundColor: '#e0f2fe', fontFamily: 'sans-serif' }}>
      <h1 style={{ fontSize: '48px', color: '#0c4a6e' }}>테스트 성공</h1>
      <p style={{ fontSize: '24px', color: '#075985' }}>
        이 페이지가 보인다면, `next-intl`과 라우팅은 정상입니다.
      </p>
      <p style={{ fontSize: '18px', color: '#0369a1', marginTop: '20px' }}>
        번역된 텍스트: "{t('heroSubtitle')}"
      </p>
    </div>
  );
}