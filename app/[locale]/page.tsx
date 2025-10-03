// app/[locale]/page.tsx (덮어쓰기)
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import Link from 'next/link';
import { getDictionary } from '@/lib/dictionary';
import { MoveRight } from 'lucide-react';

export default async function HomePage({ 
  params: { locale } 
}: { 
  params: { locale: string } 
}) {
  const session = await getServerSession(authOptions);
  const dictionary = await getDictionary(locale);
  const t = dictionary.HomePage;
  const tHeader = dictionary.Header;
  
  const baseButton = "px-6 py-2.5 text-base font-semibold rounded-lg shadow-sm transition-transform hover:scale-[1.02]";
  const primaryButton = `bg-gray-800 text-white ${baseButton}`;
  const secondaryButton = `bg-white text-gray-800 border border-gray-200 ${baseButton}`;

  if (session) {
    return (
      <main className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] p-8 text-center">
        <div className="max-w-2xl">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
            {t.loggedInTitle.replace('{name}', session.user?.name || 'User')}
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            {t.loggedInSubtitle}
          </p>
          <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/upload" className={primaryButton}>
              {t.newPostButton}
            </Link>
            <Link href="/my-posts" className={secondaryButton}>
              {t.myPostsButton}
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-white">
      <section className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] text-center p-8">
        <div className="max-w-3xl">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-gray-900 whitespace-pre-line">
            {t.heroTitle}
          </h1>
          <p className="mt-6 text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
            {t.heroSubtitle}
          </p>
          <div className="mt-10 flex flex-col sm:flex-row justify-center items-center gap-4">
            <Link href="/signup" className={`${primaryButton} flex items-center gap-2`}>
              {t.startButton} <MoveRight size={20} />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}