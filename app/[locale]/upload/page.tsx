// app/[locale]/upload/page.tsx (덮어쓰기)
import { getDictionary } from '@/lib/dictionary';
import UploadForm from './UploadForm';

export default async function UploadPage({ params: { locale } }: { params: { locale: string } }) {
  const dictionary = await getDictionary(locale);
  return <UploadForm tForm={dictionary.FormPage} tUpload={dictionary.UploadPage} />;
}