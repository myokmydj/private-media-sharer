import { notFound } from 'next/navigation';
import { db } from '@vercel/postgres';
import type { Metadata } from 'next';
import Image from 'next/image';
import { unstable_noStore as noStore } from 'next/cache';

/**
 * 데이터베이스에서 ID에 해당하는 미디어 정보를 가져옵니다.
 */
async function getMediaData(id: string) {
  noStore(); // 페이지 요청 시 항상 DB에서 최신 데이터를 가져오도록 캐싱을 비활성화합니다.
  try {
    const { rows } = await db.sql`SELECT * FROM media WHERE id = ${id} LIMIT 1;`;
    if (rows.length === 0) {
      return null;
    }
    return rows[0] as { id: string; filename: string; content_type: string };
  } catch (error) {
    console.error("Database query failed:", error);
    return null;
  }
}

/**
 * Cloudflare R2의 공개 URL을 생성합니다.
 */
function getPublicUrl(filename: string): string {
  const publicUrlBase = process.env.NEXT_PUBLIC_R2_PUBLIC_URL;
  if (!publicUrlBase) {
    console.error("Error: NEXT_PUBLIC_R2_PUBLIC_URL environment variable is not set.");
    return ''; // 환경변수가 설정되지 않은 경우 빈 문자열 반환
  }
  // URL 마지막에 '/'가 있을 경우를 대비하여 중복 슬래시 방지
  return `${publicUrlBase.replace(/\/$/, '')}/${filename}`;
}

/**
 * SNS 공유 미리보기(OG 태그)를 위한 메타데이터를 동적으로 생성합니다.
 */
export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const media = await getMediaData(params.id);

  if (!media) {
    return {
      title: '파일을 찾을 수 없습니다',
    };
  }
  
  const imageUrl = media.content_type.startsWith('image/')
    ? getPublicUrl(media.filename)
    : undefined;

  return {
    title: '공유된 미디어 파일',
    description: '친구로부터 공유된 미디어를 확인하세요.',
    openGraph: {
      title: '공유된 미디어 파일',
      description: '친구로부터 공유된 미디어를 확인하세요.',
      images: imageUrl ? [imageUrl] : [],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: '공유된 미디어 파일',
      description: '친구로부터 공유된 미디어를 확인하세요.',
      images: imageUrl ? [imageUrl] : [],
    },
  };
}

/**
 * 미디어를 보여주는 페이지 컴포넌트입니다.
 */
export default async function ViewPage({ params }: { params: { id: string } }) {
  const media = await getMediaData(params.id);

  if (!media) {
    notFound();
  }
  
  const mediaUrl = getPublicUrl(media.filename);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-black p-4">
      <div className="w-full max-w-4xl flex items-center justify-center">
        {media.content_type.startsWith('image/') && mediaUrl && (
          <div className="relative w-full h-[90vh]">
            <Image 
              src={mediaUrl} 
              alt="공유된 이미지" 
              fill={true}
              style={{ objectFit: 'contain' }}
              className="rounded-lg"
              priority
            />
          </div>
        )}
        {media.content_type.startsWith('video/') && mediaUrl && (
          <video controls autoPlay muted loop src={mediaUrl} className="max-w-full max-h-[90vh] rounded-lg">
            브라우저가 비디오 태그를 지원하지 않습니다.
          </video>
        )}
        {(!media.content_type.startsWith('image/') && !media.content_type.startsWith('video/')) || !mediaUrl && (
           <div className="p-8 bg-gray-800 text-white rounded-lg text-center">
            <p className="text-lg mb-4">
              {mediaUrl ? "지원되지 않는 미디어 형식입니다." : "미디어를 불러오는 데 실패했습니다."}
            </p>
            {mediaUrl && (
              <a href={mediaUrl} download className="text-blue-400 hover:underline mt-4 inline-block">
                파일 다운로드
              </a>
            )}
          </div>
        )}
      </div>
    </main>
  );
}