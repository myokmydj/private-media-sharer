// components/Header.tsx (수정 후 전체 코드)

'use client';

import Link from 'next/link';
// 1. next/navigation에서 useParams를 import 합니다.
import { useParams } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import LanguageSwitcher from './LanguageSwitcher';

export default function Header({ tHeader, tLang }: { tHeader: any, tLang: any }) {
  const { data: session, status } = useSession();
  const isLoading = status === 'loading';
  
  // 2. useParams 훅을 사용해 현재 URL의 파라미터를 가져옵니다.
  const params = useParams();
  const locale = params.locale as string; // 'ko', 'en' 등이 담깁니다.

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="font-bold text-xl text-gray-800">
            Private Media Sharer
          </Link>
          <div className="flex items-center space-x-2 sm:space-x-4">
            <LanguageSwitcher t={tLang} />
            
            {isLoading ? (
              <div className="w-24 h-8 bg-gray-200 rounded-md animate-pulse"></div>
            ) : session ? (
              <>
                <span className="text-sm text-gray-600 hidden sm:block">
                  {tHeader.welcome.replace('{name}', session.user?.name || 'User')}
                </span>
                <Link href="/my-posts" className="px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md">
                  {tHeader.myPosts}
                </Link>
                <Link href="/upload" className="px-3 py-2 text-sm font-medium text-white bg-gray-800 hover:bg-gray-900 rounded-md">
                  {tHeader.writePost}
                </Link>
                <button
                  // 3. callbackUrl을 동적으로 생성합니다. (예: '/ko')
                  onClick={() => signOut({ callbackUrl: `/${locale}` })}
                  className="px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
                >
                  {tHeader.logout}
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md">
                  {tHeader.login}
                </Link>
                <Link href="/signup" className="px-3 py-2 text-sm font-medium text-white bg-gray-800 hover:bg-gray-900 rounded-md">
                  {tHeader.signup}
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}