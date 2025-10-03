// components/Header.tsx (덮어쓰기)
'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import LanguageSwitcher from './LanguageSwitcher';
import Notifications from './Notifications';

export default function Header({ tHeader, tLang }: { tHeader: any, tLang: any }) {
  const { data: session, status } = useSession();
  const isLoading = status === 'loading';
  const params = useParams();
  const locale = params.locale as string;

  const linkStyle = "px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-md transition-colors";
  const ctaLinkStyle = "px-3 py-1.5 text-sm font-medium text-white bg-gray-800 hover:bg-gray-900 rounded-md transition-colors";

  return (
    <header className="bg-white/80 backdrop-blur-sm sticky top-0 z-50 border-b border-gray-200">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="font-bold text-lg text-gray-900">
            Private Media Sharer
          </Link>
          <div className="flex items-center space-x-2">
            <LanguageSwitcher t={tLang} />
            
            {isLoading ? (
              <div className="w-24 h-8 bg-gray-200 rounded-md animate-pulse"></div>
            ) : session ? (
              <>
                <Notifications />
                <div className="hidden sm:flex items-center space-x-2">
                  <Link href="/profile" className={linkStyle}>
                    {tHeader.myProfile}
                  </Link>
                  <Link href="/my-posts" className={linkStyle}>
                    {tHeader.myPosts}
                  </Link>
                  <button onClick={() => signOut({ callbackUrl: `/${locale}` })} className={linkStyle}>
                    {tHeader.logout}
                  </button>
                </div>
                <Link href="/upload" className={ctaLinkStyle}>
                  {tHeader.writePost}
                </Link>
              </>
            ) : (
              <>
                <Link href="/login" className={linkStyle}>
                  {tHeader.login}
                </Link>
                <Link href="/signup" className={ctaLinkStyle}>
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