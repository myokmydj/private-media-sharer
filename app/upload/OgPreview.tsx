'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Heart, EyeOff, Play } from 'lucide-react';
import { FastAverageColor } from 'fast-average-color';

interface OgPreviewProps {
  title: string;
  tags: string;
  content: string;
  imageUrl: string;
  isBlurred: boolean;
  isSpoiler: boolean;
  isNsfw: boolean;
}

export default function OgPreview({ title, tags, content, imageUrl, isBlurred, isSpoiler, isNsfw }: OgPreviewProps) {
  const tagList = tags ? tags.split(',').map(tag => tag.trim()).filter(Boolean) : [];

  const [backgroundColor, setBackgroundColor] = useState('#28234D');
  const [textColor, setTextColor] = useState('#FFFFFF');
  const [tagBackgroundColor, setTagBackgroundColor] = useState('rgba(255, 255, 255, 0.15)');
  const [playButtonColor, setPlayButtonColor] = useState('#28234D');

  useEffect(() => {
    if (!imageUrl) {
      setBackgroundColor('#28234D');
      setTextColor('#FFFFFF');
      setTagBackgroundColor('rgba(255, 255, 255, 0.15)');
      setPlayButtonColor('#28234D');
      return;
    }

    const fac = new FastAverageColor();
    fac.getColorAsync(imageUrl)
      .then(color => {
        setBackgroundColor(color.hex);
        if (color.isDark) {
          setTextColor('#FFFFFF');
          setTagBackgroundColor('rgba(255, 255, 255, 0.15)');
          setPlayButtonColor(color.hex);
        } else {
          setTextColor('#000000');
          setTagBackgroundColor('rgba(0, 0, 0, 0.1)');
          setPlayButtonColor(color.hex);
        }
      })
      .catch(e => {
        console.error("Error extracting color from image:", e);
      });
  }, [imageUrl]);

  // ▼▼▼ 본문 내용에서 이미지/스포일러 태그를 제거하여 순수 텍스트만 추출 ▼▼▼
  const previewText = content
    .replace(/!\[.*?\]\(.*?\)/g, '')   // Markdown 이미지 제거: ![alt](src)
    .replace(/<img[^>]*>/gi, '')      // HTML 이미지 제거: <img ...>
    .replace(/블러\[.*?\]/g, '')        // 스포일러 태그 제거: 블러[...]
    .replace(/\n/g, ' ')              // 줄바꿈을 공백으로 변환
    .trim();                          // 양쪽 공백 제거
  // ▲▲▲ 여기까지 추가 ▲▲▲

  return (
    <div>
      <h3 className="text-lg font-semibold mb-2 text-gray-800">SNS 미리보기</h3>
      <div 
        className="aspect-[1.91/1] w-full rounded-lg p-6 flex overflow-hidden shadow-lg transition-colors duration-500"
        style={{ backgroundColor: backgroundColor, color: textColor }}
      >
        {/* 이미지 영역 */}
        <div className="w-1/2 h-full relative flex-shrink-0 rounded-md overflow-hidden">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt="썸네일 미리보기"
              fill
              className={`object-cover transition-all duration-300 ${isBlurred || isNsfw ? 'blur-xl' : ''}`}
            />
          ) : (
            <div className="w-full h-full bg-gray-700 rounded-md flex items-center justify-center">
              <span className="text-gray-400">대표 이미지</span>
            </div>
          )}
          {isNsfw && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <EyeOff size={64} className="text-white" />
            </div>
          )}
        </div>

        {/* 텍스트 영역 */}
        <div className="w-1/2 h-full pl-6 flex flex-col justify-between">
          <div className="flex justify-end opacity-80">
            <Heart size={32} style={{ color: textColor }}/>
          </div>
          <div className="flex flex-col">
            <div className="flex flex-wrap gap-2 mb-3">
              {tagList.length > 0 ? tagList.map((tag, index) => (
                <span key={index} className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: tagBackgroundColor }}>
                  {tag}
                </span>
              )) : <div className="h-5"></div>}
            </div>
            <h1 className="text-2xl font-bold break-words line-clamp-2">
              {title || '제목이 여기에 표시됩니다'}
            </h1>
            <p className="text-sm opacity-70 mt-2 line-clamp-2">
              {isSpoiler 
                ? '내용이 가려졌습니다. 링크를 클릭해 확인하세요.' 
                // ▼▼▼ content 대신 정제된 previewText를 사용 ▼▼▼
                : (previewText || '내용 미리보기...')}
            </p>
          </div>
          <div className="flex justify-end">
            <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: textColor }}>
              <Play size={24} style={{ color: playButtonColor, fill: playButtonColor }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}