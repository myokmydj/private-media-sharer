// app/[locale]/page.tsx (전체 코드)

import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import Link from 'next/link';
import { getDictionary } from '@/lib/dictionary'; // 1. 우리만의 함수를 import 합니다.
import { LockKeyhole, PencilLine, Share2, ImageIcon, Eye, BookUser } from 'lucide-react';

// 2. 함수의 인자로 params를 받아 locale을 추출합니다.
export default async function HomePage({ 
  params: { locale } 
}: { 
  params: { locale: string } 
}) {
  const session = await getServerSession(authOptions);
  
  // 3. getTranslations 대신 getDictionary를 사용합니다.
  const dictionary = await getDictionary(locale);
  const t = dictionary.HomePage;
  const tHeader = dictionary.Header;

  if (session) {
    return (
      <main className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] p-8 text-center bg-gray-50">
        <div className="max-w-2xl">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800">
            {/* 4. 변수 삽입 방식을 .replace()로 변경합니다. */}
            {t.loggedInTitle.replace('{name}', session.user?.name || 'User')}
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            {t.loggedInSubtitle}
          </p>
          <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="/upload"
              className="px-8 py-4 text-lg font-semibold text-white bg-gray-800 rounded-lg shadow-md hover:bg-gray-900 transition-colors"
            >
              {t.newPostButton}
            </Link>
            <Link
              href="/my-posts"
              className="px-8 py-4 text-lg font-semibold text-gray-800 bg-white rounded-lg shadow-md hover:bg-gray-100 border border-gray-200 transition-colors"
            >
              {t.myPostsButton}
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-white text-gray-800">
      <section className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] text-center p-8 bg-gray-50">
        <div className="max-w-3xl">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight whitespace-pre-line">
            {t.heroTitle}
          </h1>
          <p className="mt-6 text-lg md:text-xl text-gray-600">
            {t.heroSubtitle}
          </p>
          <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="/signup"
              className="px-8 py-4 text-lg font-semibold text-white bg-gray-800 rounded-lg shadow-md hover:bg-gray-900 transition-colors"
            >
              {t.startButton}
            </Link>
            <Link
              href="/login"
              className="px-8 py-4 text-lg font-semibold text-gray-800 bg-white rounded-lg shadow-md hover:bg-gray-100 border border-gray-200 transition-colors"
            >
              {tHeader.login}
            </Link>
          </div>
        </div>
      </section>
      {/* ... 이하 나머지 기능 소개 섹션들은 그대로 유지하시면 됩니다 ... */}
    </main>
  );
}