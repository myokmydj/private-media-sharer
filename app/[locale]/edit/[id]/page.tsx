// app/[locale]/edit/[id]/page.tsx (덮어쓰기)
import { getDictionary } from '@/lib/dictionary';
import EditForm from './EditForm';

export default async function EditPage({ params: { locale } }: { params: { locale: string } }) {
  const dictionary = await getDictionary(locale);
  return <EditForm tForm={dictionary.FormPage} tEdit={dictionary.EditPage} />;
}