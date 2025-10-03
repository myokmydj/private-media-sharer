// components/Header.tsx (수정)

'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import LanguageSwitcher from './LanguageSwitcher';
import Notifications from './Notifications'; // ▼▼▼ [추가] Notifications 컴포넌트 import

export default function Header({ tHeader, tLang }: { tHeader: any, tLang: any }) {
  const { data: session, status } = useSession();
  const isLoading = status === 'loading';
  
  const params = useParams();
  const locale = params.locale as string;

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
                <Notifications /> {/* ▼▼▼ [추가] Notifications 컴포넌트 배치 ▼▼▼ */}
                <span className="text-sm text-gray-600 hidden sm:block">
                  {tHeader.welcome.replace('{name}', session.user?.name || 'User')}
                </span>
                <Link href="/profile" className="px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md">
                  {tHeader.myProfile}
                </Link>
                <Link href="/my-posts" className="px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md">
                  {tHeader.myPosts}
                </Link>
                <Link href="/upload" className="px-3 py-2 text-sm font-medium text-white bg-gray-800 hover:bg-gray-900 rounded-md">
                  {tHeader.writePost}
                </Link>
                <button
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