// app/[locale]/upload/OgPreview.tsx (덮어쓰기)
'use client';

import { useMemo } from 'react';
import Image from 'next/image';

interface OgPreviewProps {
  title: string;
  tags: string;
  content: string;
  imageUrl: string;
  isBlurred: boolean;
  isSpoiler: boolean;
  isNsfw: boolean;
  ogFont: string;
  // ▼▼▼ [추가] 부모 컴포넌트에서 계산된 색상 값을 직접 받습니다. ▼▼▼
  dominantColor: string | null;
  textColor: string | null;
}

// 헬퍼 함수: 색상이 어두운지 확인
function isColorDark(hexColor: string): boolean {
  if (!hexColor) return true;
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  // 밝기 계산 (Luminance)
  const luminance = (r * 299 + g * 587 + b * 114) / 1000;
  return luminance < 128;
}

// OG 폰트 이름을 Tailwind CSS 클래스로 매핑
const fontClassMap: { [key: string]: string } = {
  'Freesentation': 'font-freesentation font-black',
  'Pretendard': 'font-pretendard font-black',
  'BookkMyungjo': 'font-bookkmyungjo font-bold',
  'Paperozi': 'font-paperozi font-bold',
};

export default function OgPreview({ 
  title, tags, content, imageUrl, isBlurred, isSpoiler, isNsfw, ogFont,
  dominantColor, textColor 
}: OgPreviewProps) {
  
  const bgColor = dominantColor || '#28234D';
  const fgColor = textColor || '#FFFFFF';

  const previewText = useMemo(() => {
    if (isSpoiler) return '내용이 가려졌습니다.';
    return content
      .replace(/!\[.*?\]\(.*?\)/g, '') // 마크다운 이미지 제거
      .replace(/<img[^>]*>/gi, '')   // HTML 이미지 제거
      .replace(/<[^>]+>/g, '')       // 기타 HTML 태그 제거
      .replace(/\s+/g, ' ')          // 공백 정규화
      .trim()
      .substring(0, 100);
  }, [content, isSpoiler]);

  const tagList = useMemo(() => tags.split(',').map(tag => tag.trim()).filter(Boolean), [tags]);
  const isBgDark = isColorDark(bgColor);
  const tagBgColor = isBgDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.1)';

  return (
    <div>
      <h3 className="text-lg font-semibold mb-2 text-gray-800">SNS 미리보기</h3>
      <div className="aspect-[1.91/1] w-full rounded-lg overflow-hidden shadow-lg border border-gray-200">
        {!imageUrl ? (
          <div className="w-full h-full bg-gray-100 flex items-center justify-center">
            <span className="text-sm text-gray-500">대표 이미지를 업로드하면 미리보기가 생성됩니다.</span>
          </div>
        ) : (
          <div
            style={{ backgroundColor: bgColor, color: fgColor }}
            className={`flex w-full h-full p-8 text-lg ${fontClassMap[ogFont] || 'font-pretendard'}`}
          >
            {/* 이미지 영역 (왼쪽) */}
            <div className="w-1/2 h-full flex items-center justify-center pr-4">
              <div className="relative w-full h-full rounded-lg overflow-hidden flex">
                <Image src={imageUrl} alt="preview" fill className={`object-cover ${isBlurred || isNsfw ? 'blur-xl' : ''}`} />
                {isNsfw && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70 font-black text-5xl tracking-widest text-white">
                    NSFW
                  </div>
                )}
              </div>
            </div>

            {/* 텍스트 영역 (오른쪽) */}
            <div className="w-1/2 h-full flex flex-col justify-between pl-4">
              <div className="flex justify-end text-2xl font-black tracking-wider opacity-80">
                PREVIEW
              </div>
              
              <div className="flex flex-col">
                {tagList.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {tagList.slice(0, 3).map((tag, i) => (
                      <span key={i} style={{ backgroundColor: tagBgColor }} className="text-xs px-2 py-0.5 rounded-full">{tag}</span>
                    ))}
                  </div>
                )}
                <h1 className="text-4xl font-black break-words" style={{ lineHeight: 1.2 }}>
                  {title || '제목을 입력해주세요'}
                </h1>
                {previewText && <p className="text-base opacity-70 mt-2 line-clamp-2">{previewText}</p>}
              </div>

              <div className="flex justify-end">
                <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: fgColor }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill={bgColor}>
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}