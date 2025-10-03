// app/[locale]/upload/ContentPreview.tsx (최종 완성)

'use client';

import { useState, useEffect, MouseEvent } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import rehypeRaw from 'rehype-raw';
import type { Pluggable } from 'unified';
import ResizableImage from './ResizableImage';

interface ContentPreviewProps {
  content: string;
  fontClass: string;
  onImageResize: (src: string, newWidth: number) => void;
}

export default function ContentPreview({ content, fontClass, onImageResize }: ContentPreviewProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

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

  const processedContent = processContentForSpoilers(content);

  return (
    <div>
      <h3 className="text-lg font-semibold mb-2 text-gray-800">본문 미리보기</h3>
      <div 
        className={`prose lg:prose-lg w-full max-w-none bg-white p-6 sm:p-8 rounded-lg shadow-lg border min-h-[200px] ${fontClass}`}
        onClick={handleSpoilerClick}
      >
        {/* 서버와 초기 렌더링 시에는 이 부분을 렌더링합니다. */}
        {!isClient && <p className="text-gray-400">미리보기를 불러오는 중...</p>}
        
        {/* 클라이언트에서 마운트된 후에만 ReactMarkdown을 렌더링합니다. */}
        {isClient && content ? (
          <ReactMarkdown 
            remarkPlugins={[remarkGfm, remarkBreaks] as Pluggable[]}
            rehypePlugins={[rehypeRaw]}
            components={{
              img: ({ src, alt, width }) => {
                if (typeof src !== 'string') return null;
                const currentWidth = width ? Number(width) : undefined;
                return (
                  <ResizableImage 
                    src={src}
                    alt={alt || ''}
                    currentWidth={currentWidth}
                    onResize={onImageResize}
                  />
                );
              }
            }}
          >
            {processedContent}
          </ReactMarkdown>
        ) : isClient && (
          <p className="text-gray-400">본문 내용이 여기에 표시됩니다.</p>
        )}
      </div>
    </div>
  );
}