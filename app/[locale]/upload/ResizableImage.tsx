// ▼▼▼ "use client" 지시어 추가 ▼▼▼
'use client';
// ▲▲▲ 여기까지 추가 ▲▲▲

import { useState, useRef, MouseEvent, useEffect } from 'react';

interface ResizableImageProps {
  src: string;
  alt: string;
  currentWidth?: number;
  onResize: (src: string, newWidth: number) => void;
}

export default function ResizableImage({ src, alt, currentWidth, onResize }: ResizableImageProps) {
  const imgRef = useRef<HTMLImageElement>(null);
  const [width, setWidth] = useState(currentWidth || 500); // 기본 너비 또는 기존 너비
  const [isResizing, setIsResizing] = useState(false);
  const [isSelected, setIsSelected] = useState(false);

  // 외부 클릭 감지를 위한 ref
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsResizing(true);
  };

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (isResizing && imgRef.current) {
      const newWidth = e.clientX - imgRef.current.getBoundingClientRect().left;
      if (newWidth > 50 && newWidth < 800) { // 최소/최대 너비 제한
        setWidth(newWidth);
      }
    }
  };

  const handleMouseUp = () => {
    if (isResizing) {
      setIsResizing(false);
      onResize(src, Math.round(width)); // 리사이즈 완료 시 부모 컴포넌트에 알림
    }
  };
  
  // 외부 클릭 시 선택 해제
  useEffect(() => {
    const handleClickOutside = (event: globalThis.MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsSelected(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);


  return (
    <div
      ref={containerRef}
      className="relative my-4 inline-block"
      style={{ width: `${width}px`, maxWidth: '100%' }}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onClick={() => setIsSelected(true)}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        width={width}
        className="block h-auto rounded-lg"
        style={{ width: '100%' }}
      />
      {isSelected && (
        <>
          {/* Resize Handle */}
          <div
            className="absolute -right-1 -bottom-1 w-4 h-4 bg-blue-500 border-2 border-white rounded-full cursor-se-resize"
            onMouseDown={handleMouseDown}
          />
          {/* Outline */}
          <div className="absolute inset-0 border-2 border-blue-500 rounded-lg pointer-events-none" />
        </>
      )}
    </div>
  );
}