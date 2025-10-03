// app/[locale]/view/[id]/PostContent.tsx (최종 완성)

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

  useEffect(() => {
    setIsClient(true);
  }, []);

  const { data: session } = useSession();
  const isAuthor = session && (session.user as any).id === (post as any).user_id;

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
      <div className="flex justify-between items-start">
        <h1>{post.title}</h1>
        {isAuthor && (
          <Link href={`/edit/${post.id}`} className="not-prose p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors -mt-2 -mr-4">
            <Edit size={20} />
          </Link>
        )}
      </div>

      {/* 서버와 초기 렌더링 시에는 아무것도 렌더링하지 않거나, 간단한 로딩 메시지를 보여줍니다. */}
      {!isClient && <div>콘텐츠를 불러오는 중...</div>}

      {/* 클라이언트에서 마운트된 후에만 ReactMarkdown을 렌더링합니다. */}
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