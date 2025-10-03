// app/[locale]/view/[id]/PostContent.tsx (덮어쓰기)
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

  // ▼▼▼ [추가] 인라인 스타일 객체 생성 ▼▼▼
  const articleStyle = {
    letterSpacing: post.letter_spacing || 'normal',
    lineHeight: post.line_height || '1.75',
  };

  const processedContent = post.content; // 스포일러 처리는 CSS로만 하므로 여기서는 제거

  return (
    // ▼▼▼ [수정] article 태그에 폰트 클래스와 스타일 적용 ▼▼▼
    <article
      className={`prose lg:prose-lg w-full max-w-3xl bg-white p-6 sm:p-10 rounded-xl border border-gray-200 ${post.font_family || 'font-freesentation'}`}
      style={articleStyle}
    >
      <div className="flex justify-between items-start border-b pb-4 mb-6">
        <div>
          <h1>{post.title}</h1>
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