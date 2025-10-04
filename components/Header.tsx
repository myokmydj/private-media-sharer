// components/Header.tsx (덮어쓰기)
'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import LanguageSwitcher from './LanguageSwitcher';
import Notifications from './Notifications';
import { Plus } from 'lucide-react';

export default function Header({ tHeader, tLang }: { tHeader: any, tLang: any }) {
  const { data: session, status } = useSession();
  const isLoading = status === 'loading';
  const params = useParams();
  const locale = params.locale as string;

  const linkStyle = "px-3 py-1 text-xs font-mono font-medium text-gray-600 hover:text-black transition-colors";
  const ctaLinkStyle = "inline-flex items-center gap-1.5 px-3 py-1 text-xs font-mono font-medium text-white bg-black hover:bg-gray-800 transition-colors";

  return (
    <header className="bg-white/80 backdrop-blur-sm sticky top-0 z-50 border-b border-black">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14">
          {/* ▼▼▼ [수정] 모든 Link에 locale 추가 ▼▼▼ */}
          <Link href={`/${locale}`} className="font-mono font-bold text-base text-black">
            PRIVATE.M-SHARER
          </Link>
          <div className="flex items-center space-x-1">
            <LanguageSwitcher t={tLang} />
            
            {isLoading ? (
              <div className="w-24 h-8 bg-gray-200 animate-pulse"></div>
            ) : session ? (
              <>
                <Notifications />
                <div className="hidden sm:flex items-center space-x-1">
                  <Link href={`/${locale}/profile`} className={linkStyle}>
                    {tHeader.myProfile}
                  </Link>
                  <Link href={`/${locale}/my-posts`} className={linkStyle}>
                    {tHeader.myPosts}
                  </Link>
                  <button onClick={() => signOut({ callbackUrl: `/${locale}` })} className={linkStyle}>
                    {tHeader.logout}
                  </button>
                </div>
                <Link href={`/${locale}/memo/new`} className={linkStyle}>
                  +MEMO
                </Link>
                <Link href={`/${locale}/upload`} className={ctaLinkStyle}>
                  <Plus size={14} /> POST
                </Link>
              </>
            ) : (
              <>
                <Link href={`/${locale}/login`} className={linkStyle}>
                  {tHeader.login}
                </Link>
                <Link href={`/${locale}/signup`} className={ctaLinkStyle}>
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