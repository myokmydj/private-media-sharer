// app/[locale]/login/page.tsx (덮어쓰기)
import { Suspense } from 'react';
import { getDictionary } from '@/lib/dictionary';
import LoginForm from './LoginForm';

export default async function LoginPage({ params: { locale } }: { params: { locale: string } }) {
  const dictionary = await getDictionary(locale);

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginForm dictionary={dictionary.LoginPage} />
    </Suspense>
  );
}