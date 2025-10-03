// components/LanguageSwitcher.tsx (수정 후)
'use client';

import { usePathname, useRouter, useParams } from 'next/navigation';
import { useState, useTransition } from 'react';

export default function LanguageSwitcher({ t }: { t: any }) {
  const params = useParams();
  const locale = params.locale as string;

  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);

  const languages: { [key: string]: string } = {
    ko: t.korean,
    en: t.english,
    ja: t.japanese,
  };

  const onSelectChange = (nextLocale: string) => {
    const basePath = pathname.startsWith(`/${locale}`)
      ? pathname.substring(locale.length + 1)
      : pathname === `/${locale}` ? '/' : pathname;

    startTransition(() => {
      router.replace(`/${nextLocale}${basePath}`);
    });
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isPending}
        className="px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md flex items-center"
      >
        {languages[locale]}
        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
      </button>
      {isOpen && (
        // ▼▼▼ 바로 이 부분을 수정합니다! ▼▼▼
        <div className="absolute right-0 mt-2 w-32 bg-white rounded-md shadow-lg z-50 border border-gray-200">
          <ul className="py-1">
            {Object.keys(languages).map((langCode) => (
              <li key={langCode}>
                <button
                  onClick={() => onSelectChange(langCode)}
                  className={`w-full text-left px-4 py-2 text-sm ${locale === langCode ? 'font-bold bg-gray-100' : 'text-gray-700 hover:bg-gray-100'}`}
                >
                  {languages[langCode]}
                </button>
              </li>
            ))}
          </ul>
        </div>
        // ▲▲▲ 여기까지 수정 ▲▲▲
      )}
    </div>
  );
}