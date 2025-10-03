import { notFound } from 'next/navigation';
import { db } from '@vercel/postgres';
import type { Metadata } from 'next';
import { unstable_noStore as noStore } from 'next/cache';
import PostContent from './PostContent';
import PasswordProtect from './PasswordProtect';

interface Post {
  id: string;
  title: string;
  content: string;
  thumbnail_url: string;
  is_thumbnail_blurred: boolean;
  is_content_spoiler: boolean;
  // ▼▼▼ is_nsfw 타입 추가 ▼▼▼
  is_nsfw: boolean;
  // ▲▲▲ is_nsfw 타입 추가 ▲▲▲
  font_family: string | null;
  password: string | null;
  created_at: string;
}

async function getPostData(id: string): Promise<Post | null> {
  // ... (함수 내용은 변경 없음) ...
  noStore();
  try {
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

  const originalDescription = post.content ? post.content.replace(/\n/g, ' ').substring(0, 50) + (post.content.length > 50 ? '...' : '') : '';
  const displayDescription = post.is_content_spoiler 
    ? '내용이 가려졌습니다. 링크를 클릭해 확인하세요.' 
    : originalDescription || '친구로부터 공유된 게시물을 확인하세요.';

  const ogImageUrl = new URL(`${process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000'}/api/og`);
  ogImageUrl.searchParams.set('title', post.title);
  if (originalDescription) ogImageUrl.searchParams.set('artist', originalDescription);
  ogImageUrl.searchParams.set('imageUrl', post.thumbnail_url);
  ogImageUrl.searchParams.set('isBlurred', String(post.is_thumbnail_blurred));
  ogImageUrl.searchParams.set('isSpoiler', String(post.is_content_spoiler));
  // ▼▼▼ isNsfw 파라미터 추가 ▼▼▼
  ogImageUrl.searchParams.set('isNsfw', String(post.is_nsfw));
  // ▲▲▲ isNsfw 파라미터 추가 ▲▲▲

  return {
    // ... (title, description, openGraph, twitter 등은 변경 없음) ...
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

// ... (ViewPage 컴포넌트는 변경 없음) ...
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