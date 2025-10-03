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

/**
 * 데이터베이스에서 ID에 해당하는 게시물 정보를 가져옵니다.
 */
async function getPostData(id: string): Promise<Post | null> {
  noStore(); // 페이지 요청 시 항상 DB에서 최신 데이터를 가져오도록 캐싱 비활성화
  try {
    const { rows } = await db.sql`SELECT * FROM posts WHERE id = ${id} LIMIT 1;`;
    if (rows.length === 0) {
      return null;
    }
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

  return {
    title: post.title,
    description: '친구로부터 공유된 게시물을 확인하세요.', // 필요하다면 본문 내용 일부를 잘라서 넣어도 좋습니다.
    openGraph: {
      title: post.title,
      description: '친구로부터 공유된 게시물을 확인하세요.',
      images: [post.thumbnail_url], // DB에 저장된 대표 이미지 URL을 바로 사용
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: '친구로부터 공유된 게시물을 확인하세요.',
      images: [post.thumbnail_url],
    },
  };
}

/**
 * 게시물을 보여주는 페이지 컴포넌트입니다.
 */
export default async function ViewPage({ params }: { params: { id: string } }) {
  const post = await getPostData(params.id);

  if (!post) {
    notFound();
  }

  return (
    <main className="flex min-h-screen justify-center bg-gray-100 py-8 px-4">
      <article className="prose lg:prose-xl w-full max-w-4xl bg-white p-8 sm:p-12 rounded-lg shadow-lg">
        {/* 
          prose 클래스는 tailwindcss/typography 플러그인에서 제공하는 스타일입니다.
          만약 tailwindcss/typography를 사용하지 않는다면, 이 클래스를 제거하고 직접 스타일링해야 합니다.
          이미지 스타일링을 위해 아래와 같이 컴포넌트를 커스텀할 수 있습니다.
        */}
        <h1>{post.title}</h1>
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            img: ({node, ...props}) => (
              <img {...props} style={{ maxWidth: '100%', height: 'auto', borderRadius: '8px' }} />
            ),
          }}
        >
          {post.content}
        </ReactMarkdown>
      </article>
    </main>
  );
}