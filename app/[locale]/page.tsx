// app/[locale]/page.tsx (덮어쓰기)
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import Link from 'next/link';
import { getDictionary } from '@/lib/dictionary';
import { MoveRight, Plus } from 'lucide-react';

export default async function HomePage({ 
  params: { locale } 
}: { 
  params: { locale: string } 
}) {
  const session = await getServerSession(authOptions);
  const dictionary = await getDictionary(locale);
  const t = dictionary.HomePage;

  if (session) {
    return (
      <main className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
            {t.loggedInTitle.replace('{name}', session.user?.name || 'User')}
          </h1>
          <p className="mt-3 text-gray-600">
            {t.loggedInSubtitle}
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* ▼▼▼ [수정] Link에 locale 추가 ▼▼▼ */}
          <Link href={`/${locale}/upload`} className="group block p-8 border-2 border-dashed border-gray-400 hover:border-black hover:bg-white transition-all duration-300">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Plus size={22} /> {t.newPostButton}
            </h2>
            <p className="mt-2 text-sm text-gray-600">이미지와 텍스트를 조합하여 새로운 스토리를 공유하세요.</p>
            <div className="mt-4 text-sm font-semibold text-black flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              바로가기 <MoveRight size={16} />
            </div>
          </Link>
          {/* ▼▼▼ [수정] Link에 locale 추가 ▼▼▼ */}
          <Link href={`/${locale}/my-posts`} className="group block p-8 border border-black bg-white hover:shadow-lg transition-all duration-300">
            <h2 className="text-xl font-bold">{t.myPostsButton}</h2>
            <p className="mt-2 text-sm text-gray-600">내가 작성한 모든 포스트를 확인하고 관리합니다.</p>
             <div className="mt-4 text-sm font-semibold text-black flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              바로가기 <MoveRight size={16} />
            </div>
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-6xl mx-auto">
      <div className="relative border border-black p-8 md:p-16">
        <div className="absolute -top-2 -left-2 bg-gray-100 px-2 font-mono text-xs">
          [ PMS-HERO-SECTION ]
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <h1 className="text-4xl md:text-6xl font-serif font-extrabold tracking-tight text-black whitespace-pre-line leading-tight">
              {t.heroTitle}
            </h1>
            <p className="mt-6 text-base text-gray-700 max-w-md">
              {t.heroSubtitle}
            </p>
            <div className="mt-10">
              {/* ▼▼▼ [수정] Link에 locale 추가 ▼▼▼ */}
              <Link href={`/${locale}/signup`} className="btn-primary inline-flex items-center gap-2">
                {t.startButton} <MoveRight size={20} />
              </Link>
            </div>
          </div>
          <div className="hidden md:block relative h-80">
             <div className="absolute top-0 right-0 w-full h-full border border-black bg-white p-4">
                <div className="w-full h-full border-2 border-dashed border-gray-300 flex items-center justify-center">
                  <p className="font-mono text-gray-400">[ Your_Image_Here ]</p>
                </div>
             </div>
             <div className="absolute -bottom-4 -left-4 w-40 h-auto font-mono text-xs space-y-1">
                <p>STATUS: UNLOGGED</p>
                <p>PERMISSION: GUEST</p>
                <p>DATE: {new Date().toISOString().split('T')[0]}</p>
             </div>
          </div>
        </div>
      </div>
    </main>
  );
}