'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import rehypeRaw from 'rehype-raw';
import type { Pluggable } from 'unified';
import { MouseEvent } from 'react';
import type { Post } from '@/types'; // Post 타입을 import 합니다.

// Post 인터페이스를 여기서 제거합니다.

export default function PostContent({ post }: { post: Post }) {
  // ... 나머지 코드는 동일 ...
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
      <h1>{post.title}</h1>
      <ReactMarkdown 
        remarkPlugins={[remarkGfm, remarkBreaks] as Pluggable[]}
        rehypePlugins={[rehypeRaw]}
        components={{ 
          'img': ({ ...props }) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img {...props} style={{ maxWidth: '100%', height: 'auto', borderRadius: '8px' }} alt="" /> 
          )
        }}
      >
        {processedContent}
      </ReactMarkdown>
    </article>
  );
}