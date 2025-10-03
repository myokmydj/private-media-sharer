'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import rehypeRaw from 'rehype-raw';
import type { Pluggable } from 'unified';
import { MouseEvent } from 'react';
import ResizableImage from './ResizableImage';

interface ContentPreviewProps {
  content: string;
  fontClass: string;
  onImageResize: (src: string, newWidth: number) => void;
}

export default function ContentPreview({ content, fontClass, onImageResize }: ContentPreviewProps) {
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
        {content ? (
          <ReactMarkdown 
            remarkPlugins={[remarkGfm, remarkBreaks] as Pluggable[]}
            rehypePlugins={[rehypeRaw]}
            components={{
              p: ({ node, children }) => {
                // ▼▼▼ node가 undefined일 경우를 대비한 방어 코드 추가 ▼▼▼
                if (!node) {
                  return <p>{children}</p>;
                }
                const firstChild = node.children[0];
                if (
                  node.children.length === 1 &&
                  firstChild && 'tagName' in firstChild &&
                  firstChild.tagName === 'img'
                ) {
                  return <>{children}</>;
                }
                // ▲▲▲ 여기까지 수정 ▲▲▲
                return <p>{children}</p>;
              },
              img: ({ src, alt, width }) => {
                const currentWidth = width ? Number(width) : undefined;
                return (
                  <ResizableImage 
                    src={src || ''} 
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
        ) : (
          <p className="text-gray-400">본문 내용이 여기에 표시됩니다.</p>
        )}
      </div>
    </div>
  );
}