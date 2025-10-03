import { notFound } from 'next/navigation';
import { db } from '@vercel/postgres';
import type { Metadata } from 'next';
import { unstable_noStore as noStore } from 'next/cache';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Post {
  id: string;
  title: string;
  content: string;
  thumbnail_url: string;
  // 👇 새로운 속성 추가
  is_thumbnail_blurred: boolean;
  is_content_spoiler: boolean;
  created_at: string;
}

async function getPostData(id: string): Promise<Post | null> {
  noStore();
  try {
    // 👇 is_thumbnail_blurred, is_content_spoiler 컬럼을 함께 조회
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

  const artistName = post.content ? post.content.replace(/\n/g, ' ').substring(0, 50) + (post.content.length > 50 ? '...' : '') : '';
  
  const ogImageUrl = new URL(`${process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000'}/api/og`);
  ogImageUrl.searchParams.set('title', post.title);
  if (artistName) ogImageUrl.searchParams.set('artist', artistName);
  ogImageUrl.searchParams.set('imageUrl', post.thumbnail_url);
  // 👇 새로운 파라미터 전달
  ogImageUrl.searchParams.set('isBlurred', String(post.is_thumbnail_blurred));
  ogImageUrl.searchParams.set('isSpoiler', String(post.is_content_spoiler));

  return {
    title: post.title,
    description: artistName || '친구로부터 공유된 게시물을 확인하세요.',
    openGraph: {
      title: post.title,
      description: artistName || '친구로부터 공유된 게시물을 확인하세요.',
      images: [ogImageUrl.toString()],
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: artistName || '친구로부터 공유된 게시물을 확인하세요.',
      images: [ogImageUrl.toString()],
    },
  };
}

export default async function ViewPage({ params }: { params: { id: string } }) {
  // ... (이 컴포넌트는 변경 없음)
  const post = await getPostData(params.id);
  if (!post) notFound();
  return (
    <main className="flex min-h-screen justify-center bg-gray-100 py-8 px-4">
      <article className="prose lg:prose-xl w-full max-w-4xl bg-white p-8 sm:p-12 rounded-lg shadow-lg">
        <h1>{post.title}</h1>
        <ReactMarkdown remarkPlugins={[remarkGfm]} components={{ 'img': ({ node, ...props }) => ( <img {...props} style={{ maxWidth: '100%', height: 'auto', borderRadius: '8px' }} alt="" /> ) }}>
          {post.content}
        </ReactMarkdown>
      </article>
    </main>
  );
}