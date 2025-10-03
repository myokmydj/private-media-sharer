// app/[locale]/view/[id]/PostContent.tsx (전체 코드)

'use client';

import { useState, useEffect, MouseEvent } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import rehypeRaw from 'rehype-raw';
import type { Pluggable } from 'unified';
import type { Post } from '@/types';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Edit } from 'lucide-react';

export default function PostContent({ post }: { post: Post }) {
  const [isClient, setIsClient] = useState(false);
  useEffect(() => { setIsClient(true); }, []);

  const { data: session } = useSession();
  const isAuthor = session && (session.user as any).id === String(post.user_id);

  const handleSpoilerClick = (e: MouseEvent<HTMLElement>) => {
    const target = e.target as HTMLElement;
    if (target.classList.contains('spoiler')) {
      target.classList.remove('spoiler');
      target.classList.add('spoiler-revealed');
    }
  };

  const processContentForSpoilers = (text: string) => {
    return text.replace(/블러\[(.*?)\]/g, '<span class="spoiler">$1</span>');
  };

  const processedContent = processContentForSpoilers(post.content);

  return (
    <article
      className="prose lg:prose-lg w-full max-w-3xl bg-white p-6 sm:p-10 rounded-lg shadow-lg"
      onClick={handleSpoilerClick}
    >
      <div className="flex justify-between items-start border-b pb-4 mb-6">
        <div>
          <h1>{post.title}</h1>
          {/* ▼▼▼ 작성자 이름과 프로필 링크 추가 ▼▼▼ */}
          {post.author_name && post.user_id && (
            <div className="not-prose -mt-4">
              <Link
                href={`/profile/${post.user_id}`}
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                by {post.author_name}
              </Link>
            </div>
          )}
        </div>
        {isAuthor && (
          <Link href={`/edit/${post.id}`} className="not-prose p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors -mt-2 -mr-4">
            <Edit size={20} />
          </Link>
        )}
      </div>

      {!isClient && <div>콘텐츠를 불러오는 중...</div>}

      {isClient && (
        <ReactMarkdown
          remarkPlugins={[remarkGfm, remarkBreaks] as Pluggable[]}
          rehypePlugins={[rehypeRaw]}
          components={{
            'img': ({ ...props }) => (
              <img {...props} style={{ maxWidth: '100%', height: 'auto', borderRadius: '8px' }} alt="" />
            )
          }}
        >
          {processedContent}
        </ReactMarkdown>
      )}
    </article>
  );
}