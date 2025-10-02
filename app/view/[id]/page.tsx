import { notFound } from 'next/navigation';
import { db } from '@vercel/postgres';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import type { Metadata } from 'next';
import Image from 'next/image';
import { unstable_noStore as noStore } from 'next/cache';

// R2/S3 클라이언트 설정 (환경변수에서 값을 가져옵니다)
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
  noStore(); // 캐싱 방지

  // --- 🕵️‍♂️ 디버깅 로그 시작 🕵️‍♂️ ---
  console.log(`[DEBUG] getMediaData 함수 시작. ID: ${id}`);

  try {
    const { rows } = await db.sql`SELECT * FROM media WHERE id = ${id} LIMIT 1;`;
    
    console.log(`[DEBUG] DB 쿼리 실행 완료. 찾은 row 개수: ${rows.length}`);

    if (rows.length > 0) {
      console.log('[DEBUG] 데이터를 찾았습니다:', JSON.stringify(rows[0]));
    } else {
      console.log('[DEBUG] DB에서 해당 ID의 데이터를 찾지 못했습니다.');
    }
    // --- 🕵️‍♂️ 디버깅 로그 종료 🕵️‍♂️ ---

    if (rows.length === 0) {
      return null;
    }
    return rows[0] as { id: string; filename: string; content_type: string };
  } catch (error) {
    // --- 🕵️‍♂️ 에러 로그 추가 🕵️‍♂️ ---
    console.error('[ERROR] getMediaData 함수에서 DB 쿼리 중 에러 발생:', error);
    return null; // 에러 발생 시에도 null을 반환하여 404 처리
  }
}

// R2에서 임시 접근 URL(pre-signed URL) 생성 함수
async function getPresignedUrl(key: string) {
  try {
    const command = new GetObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: key,
    });
    // 15분 동안 유효한 링크 생성
    const url = await getSignedUrl(s3Client, command, { expiresIn: 900 });
    console.log('[DEBUG] Pre-signed URL 생성 성공.');
    return url;
  } catch (error) {
    console.error('[ERROR] Pre-signed URL 생성 중 에러 발생:', error);
    // 에러 발생 시 빈 문자열이나 기본 이미지 URL을 반환할 수 있습니다.
    return '';
  }
}

// SNS 공유 미리보기를 위한 Metadata 생성 함수
export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  console.log(`[DEBUG] generateMetadata 함수 시작. ID: ${params.id}`);
  const media = await getMediaData(params.id);

  if (!media) {
    console.log('[DEBUG] generateMetadata: 미디어 데이터가 없어 기본 메타데이터를 반환합니다.');
    return {
      title: '파일을 찾을 수 없습니다',
    };
  }
  
  // 썸네일용 pre-signed URL 생성 (이미지인 경우에만)
  const imageUrl = media.content_type.startsWith('image/')
    ? await getPresignedUrl(media.filename)
    : ''; // 이미지가 아니면 빈 값

  console.log('[DEBUG] generateMetadata: 메타데이터를 생성합니다.');
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


// 페이지 렌더링 컴포넌트
export default async function ViewPage({ params }: { params: { id: string } }) {
  console.log(`[DEBUG] ViewPage 렌더링 시작. params.id: ${params.id}`);
  const media = await getMediaData(params.id);

  if (!media) {
    console.log('[DEBUG] ViewPage: media 데이터가 없으므로 notFound()를 호출합니다.');
    notFound(); // 404 페이지 표시
  }
  
  console.log('[DEBUG] ViewPage: media 데이터를 성공적으로 가져왔습니다. pre-signed URL을 생성합니다.');
  const mediaUrl = await getPresignedUrl(media.filename);
  console.log('[DEBUG] ViewPage: pre-signed URL 생성 완료. 페이지를 렌더링합니다.');

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-black p-4">
      <div className="w-full max-w-4xl">
        {media.content_type.startsWith('image/') && mediaUrl && (
          <div className="relative w-full h-[90vh]">
            <Image 
              src={mediaUrl} 
              alt="공유된 이미지" 
              fill={true}
              style={{ objectFit: 'contain' }}
              className="rounded-lg"
              priority // LCP(Largest Contentful Paint) 최적화를 위해 추가
            />
          </div>
        )}
        {media.content_type.startsWith('video/') && mediaUrl && (
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
        {/* pre-signed URL 생성 실패 시 메시지 표시 */}
        {!mediaUrl && (
          <div className="p-8 bg-red-900 text-white rounded-lg">
            <p>미디어를 불러오는 데 실패했습니다. 잠시 후 다시 시도해주세요.</p>
          </div>
        )}
      </div>
    </main>
  );
}