// app/[locale]/not-found.tsx (수정 후)
'use client'; // 클라이언트 컴포넌트 유지

import Link from 'next/link';

// 이 페이지는 props를 받을 수 없으므로,
// useTranslations 대신 간단한 텍스트를 사용하거나,
// 언어별로 다른 텍스트를 보여주려면 useParams로 locale을 확인해야 합니다.
// 여기서는 가장 간단하게 영어로 통일하겠습니다.
export default function NotFoundPage() {
  return (
    <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md p-8 text-center space-y-6 bg-white rounded-lg shadow-md">
        <h1 className="text-9xl font-black text-gray-200">404</h1>
        <h2 className="text-3xl font-bold text-gray-900">Page Not Found</h2>
        <p className="text-gray-600">Sorry, the page you are looking for does not exist.</p>
        <Link
          href="/"
          className="inline-block px-6 py-3 text-lg font-medium text-white bg-gray-800 rounded-md hover:bg-gray-900"
        >
          Go Home
        </Link>
      </div>
    </main>
  );
}