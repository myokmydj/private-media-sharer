// app/[locale]/layout.tsx (수정 후 전체 코드)

import type { Metadata } from 'next';
import AuthProvider from '@/components/SessionProvider';
import Header from '@/components/Header';
import { getDictionary } from '@/lib/dictionary';
import '../globals.css';

export const metadata: Metadata = {
  title: 'Private Media Sharer',
  description: 'Share your own story privately.',
};

export default async function RootLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const dictionary = await getDictionary(locale);

  return (
    <html lang={locale}>
      <body className="font-pretendard bg-gray-100">
        <AuthProvider>
          <Header
            tHeader={dictionary.Header}
            tLang={dictionary.LanguageSwitcher}
          />
          <main className="py-8 px-4">{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}