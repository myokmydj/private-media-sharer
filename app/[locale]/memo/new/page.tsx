// app/[locale]/memo/new/page.tsx (덮어쓰기)
import { getDictionary } from '@/lib/dictionary';
import NewMemoForm from './NewMemoForm';

export default async function NewMemoPage({ params: { locale } }: { params: { locale: string } }) {
  const dictionary = await getDictionary(locale);
  return <NewMemoForm dictionary={dictionary.MemoPage} />;
}