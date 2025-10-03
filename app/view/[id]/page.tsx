import { notFound } from 'next/navigation';
import { db } from '@vercel/postgres';
import type { Metadata } from 'next';
import { unstable_noStore as noStore } from 'next/cache';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// ... (Post, getPostData, generateMetadata 함수는 변경 없음)
interface Post {
  id: string;
  title: string;
  content: string;
  thumbnail_url: string;
  created_at: string;
}

async function getPostData(id: string): Promise<Post | null> {
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
    return {
      title: '게시물을 찾을 수 없습니다',
    };
  }

  const artistName = post.content
    ? post.content.replace(/\n/g, ' ').substring(0, 50) + (post.content.length > 50 ? '...' : '')
    : '';
  
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
  const post = await getPostData(params.id);
  if (!post) notFound();

  return (
    <main className="flex min-h-screen justify-center bg-gray-100 py-8 px-4">
      <article className="prose lg:prose-xl w-full max-w-4xl bg-white p-8 sm:p-12 rounded-lg shadow-lg">
        <h1>{post.title}</h1>
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            // 👇 여기가 최종 수정된 부분입니다.
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            img: ({ node, ...props }) => (
              // eslint-disable-next-line @next/next/no-img-element
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