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

  // ▼▼▼ '블러[...]' 치환자를 HTML 태그로 변환하는 로직 ▼▼▼
  const processContentForSpoilers = (text: string) => {
    // /블러\[(.*?)\]/g 정규식:
    // '블러[' 로 시작하고 ']' 로 끝나는 모든 문자열을 찾습니다.
    // (.*?) 는 괄호 안의 내용을 캡처합니다. '?'는 탐욕적이지 않은(non-greedy) 매칭을 의미합니다.
    // g 플래그는 문자열 전체에서 모든 일치 항목을 찾도록 합니다.
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
          'img': ({ node, ...props }) => ( 
            <img {...props} style={{ maxWidth: '100%', height: 'auto', borderRadius: '8px' }} alt="" /> 
          ) 
        }}
      >
        {processedContent}
      </ReactMarkdown>
    </article>
  );
}