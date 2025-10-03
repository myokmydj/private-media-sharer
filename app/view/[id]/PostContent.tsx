'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import rehypeRaw from 'rehype-raw';
import type { Pluggable } from 'unified';
import { MouseEvent } from 'react';

interface Post {
  id: string;
  title: string;
  content: string;
  thumbnail_url: string;
  is_thumbnail_blurred: boolean;
  is_content_spoiler: boolean;
  font_family: string | null;
  password: string | null;
  created_at: string;
}

export default function PostContent({ post }: { post: Post }) {
  
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
          // ▼▼▼ 경고 해결을 위해 코드 수정 ▼▼▼
          'img': ({ ...props }) => ( // 1. 사용하지 않는 'node' 제거
            // 2. img 태그 경고를 무시하는 주석 추가
            // eslint-disable-next-line @next/next/no-img-element
            <img {...props} style={{ maxWidth: '100%', height: 'auto', borderRadius: '8px' }} alt="" /> 
          )
          // ▲▲▲ 여기까지 수정 ▲▲▲
        }}
      >
        {processedContent}
      </ReactMarkdown>
    </article>
  );
}