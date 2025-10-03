import { notFound } from 'next/navigation';
import { db } from '@vercel/postgres';
import type { Metadata } from 'next';
import { unstable_noStore as noStore } from 'next/cache';
import PostContent from './PostContent';
import PasswordProtect from './PasswordProtect';

// Post 인터페이스에 dominant_color와 text_color 추가
interface Post {
  id: string;
  title: string;
  tags: string | null;
  content: string;
  thumbnail_url: string;
  is_thumbnail_blurred: boolean;
  is_content_spoiler: boolean;
  is_nsfw: boolean;
  font_family: string | null;
  password: string | null;
  created_at: string;
  dominant_color: string | null;
  text_color: string | null;
}

async function getPostData(id: string): Promise<Post | null> {
  noStore();
  try {
    // 모든 컬럼을 가져오도록 SELECT * 사용
    const { rows } = await db.sql`SELECT * FROM posts WHERE id = ${id} LIMIT 1;`;
    if (rows.length === 0) return null;
    return rows[0] as Post;
  } catch (error) {
    console.error("Database query failed:", error);
    return null;
  }
}

export async function generateMetadata({ params }: { params: { id:string } }): Promise<Metadata> {
  const post = await getPostData(params.id);

  if (!post) {
    return { title: '게시물을 찾을 수 없습니다' };
  }

  // OG 이미지 URL에 사용할 안전한 설명 텍스트 생성
  const cleanDescriptionForOg = post.content
    ? post.content
        .replace(/!\[.*?\]\(.*?\)/g, '')   // Markdown 이미지 제거
        .replace(/<img[^>]*>/gi, '')      // HTML 이미지 제거
        .replace(/블러\[.*?\]/g, '')        // 스포일러 태그 제거
        .replace(/[`*_{}[\]()#+\-.!]/g, '') // 일반적인 마크다운 특수 문자 제거
        .replace(/\s+/g, ' ')             // 여러 공백을 하나로 축소
        .trim()
        .substring(0, 100)                // URL 길이를 위해 100자로 제한
    : '';

  // SNS 텍스트 미리보기에 표시될 설명
  const displayDescription = post.is_content_spoiler 
    ? '내용이 가려졌습니다. 링크를 클릭해 확인하세요.' 
    : cleanDescriptionForOg || '친구로부터 공유된 게시물을 확인하세요.';

  const ogImageUrl = new URL(`${process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000'}/api/og`);
  
  // 기본 정보 설정
  ogImageUrl.searchParams.set('title', post.title);
  ogImageUrl.searchParams.set('imageUrl', post.thumbnail_url);
  ogImageUrl.searchParams.set('isBlurred', String(post.is_thumbnail_blurred));
  ogImageUrl.searchParams.set('isSpoiler', String(post.is_content_spoiler));
  ogImageUrl.searchParams.set('isNsfw', String(post.is_nsfw));
  
  // 조건부 정보 설정
  if (cleanDescriptionForOg) {
    ogImageUrl.searchParams.set('artist', cleanDescriptionForOg);
  }
  if (post.tags) {
    ogImageUrl.searchParams.set('tags', post.tags);
  }

  // DB에서 읽어온 색상 값을 URL 파라미터로 추가
  if (post.dominant_color) {
    ogImageUrl.searchParams.set('bgColor', post.dominant_color);
  }
  if (post.text_color) {
    ogImageUrl.searchParams.set('textColor', post.text_color);
  }

  return {
    title: post.title,
    description: displayDescription,
    openGraph: {
      title: post.title,
      description: displayDescription,
      images: [ogImageUrl.toString()],
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: displayDescription,
      images: [ogImageUrl.toString()],
    },
  };
}

export default async function ViewPage({ params }: { params: { id: string } }) {
  const post = await getPostData(params.id);
  if (!post) notFound();
  
  return (
    <main className={`flex min-h-screen items-center justify-center bg-gray-100 py-8 px-4 ${post.font_family || 'font-pretendard'}`}>
      {post.password ? (
        <PasswordProtect post={post} />
      ) : (
        <PostContent post={post} />
      )}
    </main>
  );
}