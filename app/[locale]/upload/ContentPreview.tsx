// app/[locale]/upload/ContentPreview.tsx (덮어쓰기)

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
  // ▼▼▼ [추가] 자간, 행간 props 타입 추가 ▼▼▼
  letterSpacing?: string;
  lineHeight?: string;
}

export default function ContentPreview({ 
  content, 
  fontClass, 
  onImageResize,
  letterSpacing, // ▼▼▼ props 받기
  lineHeight,    // ▼▼▼ props 받기
}: ContentPreviewProps) {
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

  // ▼▼▼ [추가] 자간, 행간을 위한 인라인 스타일 객체 생성 ▼▼▼
  const previewStyle = {
    letterSpacing: letterSpacing === '0' || !letterSpacing ? 'normal' : `${letterSpacing}em`,
    lineHeight: lineHeight || '1.75',
  };

  return (
    <div>
      <h3 className="text-lg font-semibold mb-2 text-gray-800">본문 미리보기</h3>
      {/* ▼▼▼ [추가] 이미지 리사이즈 안내 문구 ▼▼▼ */}
      <p className="text-xs text-gray-500 mb-2 -mt-1">
        본문 내 이미지는 우측 하단 핸들을 클릭하여 크기를 조절할 수 있습니다.
      </p>
      <div 
        className={`prose lg:prose-lg w-full max-w-none bg-white p-6 sm:p-8 rounded-lg shadow-lg border min-h-[200px] ${fontClass}`}
        onClick={handleSpoilerClick}
        style={previewStyle} // ▼▼▼ [수정] style 속성 적용
      >
        {!isClient && <p className="text-gray-400">미리보기를 불러오는 중...</p>}
        
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