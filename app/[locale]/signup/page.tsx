// app/[locale]/signup/page.tsx (덮어쓰기)
import { getDictionary } from '@/lib/dictionary';
import SignupForm from './SignupForm';

export default async function SignupPage({ params: { locale } }: { params: { locale: string } }) {
  const dictionary = await getDictionary(locale);
  return <SignupForm dictionary={dictionary.SignupPage} />;
}