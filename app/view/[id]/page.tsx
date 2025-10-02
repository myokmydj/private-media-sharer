import { notFound } from 'next/navigation';
import { db } from '@vercel/postgres';
import type { Metadata } from 'next';
import Image from 'next/image';

// --- 함수들은 그대로 둡니다. generateMetadata에서만 사용하지 않을 뿐입니다. ---

/**
 * 데이터베이스에서 ID에 해당하는 미디어 정보를 가져옵니다.
 */
async function getMediaData(id: string) {
  // noStore()는 이제 generateMetadata에서 호출되지 않으므로 페이지 로드에만 영향을 줍니다.
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
    return '';
  }
  return `${publicUrlBase.replace(/\/$/, '')}/${filename}`;
}


// --- 🚨 여기가 핵심 변경 사항입니다 🚨 ---

/**
 * SNS 공유 미리보기(OG 태그)를 위한 메타데이터를 동적으로 생성합니다.
 * [진단용 임시 코드] DB 조회 없이 항상 고정된 값을 반환하여 테스트합니다.
 */
export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  console.log(`[DIAGNOSTIC] Static generateMetadata for ID: ${params.id}`);

  // DB 조회 로직을 모두 제거하고, 즉시 고정된 값을 반환합니다.
  return {
    title: '정적 테스트 제목 (Static Test Title)',
    description: '이 설명이 보이면 메타 태그 생성 기능은 정상입니다.',
    
    // Open Graph (페이스북, 카카오톡 등)
    openGraph: {
      title: '정적 테스트 제목 (Static Test Title)',
      description: '이 설명이 보이면 메타 태그 생성 기능은 정상입니다.',
      // 테스트를 위해 누구나 접근 가능한 공개 이미지 URL을 사용합니다.
      images: [
        {
          url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/Wikipedia-logo-v2.svg/1200px-Wikipedia-logo-v2.svg.png',
          width: 1200,
          height: 1200,
          alt: 'Test Image',
        },
      ],
      type: 'website',
    },

    // Twitter Cards
    twitter: {
      card: 'summary_large_image',
      title: '정적 테스트 제목 (Static Test Title)',
      description: '이 설명이 보이면 메타 태그 생성 기능은 정상입니다.',
      images: ['https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/Wikipedia-logo-v2.svg/1200px-Wikipedia-logo-v2.svg.png'],
    },
  };
}


export default async function ViewPage({ params }: { params: { id: string } }) {
  const media = await getMediaData(params.id);

  if (!media) {
    notFound();
  }
  
  const mediaUrl = getPublicUrl(media.filename);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-black p-4">
      <div className="w-full max-w-4xl flex items-center justify-center">
        {/* 이미지 렌더링 */}
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

        {/* 비디오 렌더링 */}
        {media.content_type.startsWith('video/') && mediaUrl && (
          <video controls autoPlay muted loop src={mediaUrl} className="max-w-full max-h-[90vh] rounded-lg">
            브라우저가 비디오 태그를 지원하지 않습니다.
          </video>
        )}

        {/* 기타 파일 형식 또는 URL 생성 실패 시 */}
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