import { notFound } from 'next/navigation';
import { db } from '@vercel/postgres';
import type { Metadata } from 'next';
import { unstable_noStore as noStore } from 'next/cache';
import PostContent from './PostContent';
import PasswordProtect from './PasswordProtect';
import type { Post } from '@/types';

// 별도의 Props 인터페이스를 완전히 제거합니다.

async function getPostData(id: string): Promise<Post | null> {
  noStore();
  try {
    const { rows } = await db.sql<Post>`SELECT * FROM posts WHERE id = ${id} LIMIT 1;`;
    if (rows.length === 0) return null;
    return rows[0];
  } catch (error) {
    console.error("Database query failed:", error);
    return null;
  }
}

// 매개변수 위치에 직접 타입을 명시합니다.
export async function generateMetadata(
  { params }: { params: { id: string } }
): Promise<Metadata> {
  const post = await getPostData(params.id);

  if (!post) {
    return { title: '게시물을 찾을 수 없습니다' };
  }

  const cleanDescriptionForOg = post.content
    ? post.content
        .replace(/!\[.*?\]\(.*?\)/g, '')
        .replace(/<img[^>]*>/gi, '')
        .replace(/블러\[.*?\]/g, '')
        .replace(/[`*_{}[\]()#+\-.!]/g, '')
        .replace(/\s+/g, ' ')
        .trim()
        .substring(0, 100)
    : '';

  const displayDescription = post.is_content_spoiler 
    ? '내용이 가려졌습니다. 링크를 클릭해 확인하세요.' 
    : cleanDescriptionForOg || '친구로부터 공유된 게시물을 확인하세요.';

  const ogImageUrl = new URL(`${process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000'}/api/og`);
  
  ogImageUrl.searchParams.set('title', post.title);
  ogImageUrl.searchParams.set('imageUrl', post.thumbnail_url);
  ogImageUrl.searchParams.set('isBlurred', String(post.is_thumbnail_blurred));
  ogImageUrl.searchParams.set('isSpoiler', String(post.is_content_spoiler));
  ogImageUrl.searchParams.set('isNsfw', String(post.is_nsfw));
  
  if (cleanDescriptionForOg) {
    ogImageUrl.searchParams.set('artist', cleanDescriptionForOg);
  }
  if (post.tags) {
    ogImageUrl.searchParams.set('tags', post.tags);
  }
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

// 페이지 컴포넌트에도 직접 타입을 명시합니다.
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