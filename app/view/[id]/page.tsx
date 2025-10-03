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
  created_at: string;
}

async function getPostData(id: string): Promise<Post | null> {
  // ... (이 함수는 변경 없음)
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

/**
 * SNS 공유 미리보기(OG 태그)를 위한 메타데이터를 동적으로 생성합니다.
 */
export async function generateMetadata({ params }: { params: { id:string } }): Promise<Metadata> {
  const post = await getPostData(params.id);

  if (!post) {
    return {
      title: '게시물을 찾을 수 없습니다',
    };
  }

  // 본문 내용에서 첫 50자를 잘라 '가수 이름'으로 사용
  const artistName = post.content
    ? post.content.replace(/\n/g, ' ').substring(0, 50) + (post.content.length > 50 ? '...' : '')
    : '';
  
  // 이미지 생성 API에 전달할 URL 파라미터를 만듭니다.
  const ogImageUrl = new URL(`${process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000'}/api/og`);
  ogImageUrl.searchParams.set('title', post.title);
  if (artistName) {
    ogImageUrl.searchParams.set('artist', artistName);
  }
  ogImageUrl.searchParams.set('imageUrl', post.thumbnail_url);

  return {
    title: post.title,
    description: artistName || '친구로부터 공유된 게시물을 확인하세요.',
    openGraph: {
      title: post.title,
      description: artistName || '친구로부터 공유된 게시물을 확인하세요.',
      // 이제 직접 생성한 이미지 URL을 사용합니다!
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

/**
 * 게시물을 보여주는 페이지 컴포넌트입니다.
 */
export default async function ViewPage({ params }: { params: { id: string } }) {
  // ... (이 컴포넌트는 변경 없음)
  const post = await getPostData(params.id);
  if (!post) notFound();

  return (
    <main className="flex min-h-screen justify-center bg-gray-100 py-8 px-4">
      <article className="prose lg:prose-xl w-full max-w-4xl bg-white p-8 sm:p-12 rounded-lg shadow-lg">
        <h1>{post.title}</h1>
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            img: ({node, ...props}) => (
              <img {...props} style={{ maxWidth: '100%', height: 'auto', borderRadius: '8px' }} alt="" />
            ),
          }}
        >
          {post.content}
        </ReactMarkdown>
      </article>
    </main>
  );
}