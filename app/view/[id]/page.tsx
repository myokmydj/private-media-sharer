import { notFound } from 'next/navigation';
import { db } from '@vercel/postgres';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import Image from 'next/image';
import { unstable_noStore as noStore } from 'next/cache';
import type { Metadata } from 'next';

const s3Client = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT!,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

// DB에서 미디어 정보 가져오는 함수
async function getMediaData(id: string) {
  noStore(); // 2. 함수 맨 위에 이 라인을 추가하여 캐싱을 비활성화합니다.
  const { rows } = await db.sql`SELECT * FROM media WHERE id = ${id} LIMIT 1;`;
  if (rows.length === 0) {
    return null;
  }
  return rows[0] as { id: string; filename: string; content_type: string };
}

// R2에서 임시 접근 URL(pre-signed URL) 생성 함수
async function getPresignedUrl(key: string) {
  const command = new GetObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME!,
    Key: key,
  });
  // 15분 동안 유효한 링크 생성
  return getSignedUrl(s3Client, command, { expiresIn: 900 });
}

// ⭐️ SNS 공유 미리보기를 위한 Metadata 생성 함수
export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const media = await getMediaData(params.id);

  if (!media) {
    return {
      title: '파일을 찾을 수 없습니다',
    };
  }
  
  const imageUrl = await getPresignedUrl(media.filename);

  return {
    title: '공유된 미디어 파일',
    description: '친구로부터 공유된 미디어를 확인하세요.',
    openGraph: {
      title: '공유된 미디어 파일',
      description: '친구로부터 공유된 미디어를 확인하세요.',
      // 이미지만 OG 태그에서 제대로 보입니다. 영상은 썸네일이 필요합니다.
      images: media.content_type.startsWith('image/') ? [imageUrl] : [],
      type: 'website',
    },
    // 트위터 카드용
    twitter: {
      card: 'summary_large_image',
      title: '공유된 미디어 파일',
      description: '친구로부터 공유된 미디어를 확인하세요.',
      images: media.content_type.startsWith('image/') ? [imageUrl] : [],
    },
  };
}


// 페이지 렌더링 컴포넌트
export default async function ViewPage({ params }: { params: { id: string } }) {
  const media = await getMediaData(params.id);

  if (!media) {
    notFound(); // 404 페이지 표시
  }

  const mediaUrl = await getPresignedUrl(media.filename);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-black p-4">
      <div className="w-full max-w-4xl">
        {media.content_type.startsWith('image/') && (
          <div className="relative w-full h-[90vh]">
            <Image 
              src={mediaUrl} 
              alt="공유된 이미지" 
              fill={true}
              style={{ objectFit: 'contain' }}
              className="rounded-lg"
            />
          </div>
        )}
        {media.content_type.startsWith('video/') && (
          <video controls src={mediaUrl} className="max-w-full max-h-[90vh] rounded-lg">
            브라우저가 비디오 태그를 지원하지 않습니다.
          </video>
        )}
        {!media.content_type.startsWith('image/') && !media.content_type.startsWith('video/') && (
           <div className="p-8 bg-gray-800 text-white rounded-lg">
            <p>지원되지 않는 미디어 형식입니다.</p>
            <a href={mediaUrl} download className="text-blue-400 hover:underline mt-4 inline-block">파일 다운로드</a>
          </div>
        )}
      </div>
    </main>
  );
}