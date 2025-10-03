'use client';

import { useState, ChangeEvent, FormEvent, useRef } from 'react';
import Image from 'next/image';

export default function UploadPage() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState<string>('');
  const [isThumbnailUploading, setIsThumbnailUploading] = useState(false);
  const [isBlurred, setIsBlurred] = useState(false);
  const [isSpoiler, setIsSpoiler] = useState(false);
  const [isNsfw, setIsNsfw] = useState(false); // NSFW 상태 추가
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generatedLink, setGeneratedLink] = useState('');
  const [error, setError] = useState('');
  const [selectedFont, setSelectedFont] = useState('font-pretendard');
  const [password, setPassword] = useState('');

  const contentRef = useRef<HTMLTextAreaElement>(null);

  const fontClasses: { [key: string]: string } = {
    'font-pretendard': '프리텐다드 (고딕)',
    'font-bookkmyungjo': '북크 명조',
    'font-freesentation': '프리젠테이션 (고딕)',
  };

  const handleThumbnailUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setIsThumbnailUploading(true);
    setError('');
    const formData = new FormData();
    formData.append('file', file);
    try {
      const response = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setThumbnailUrl(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : '대표 이미지 업로드 실패');
    } finally {
      setIsThumbnailUploading(false);
    }
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    setIsUploading(true);
    setError('');
    for (const file of Array.from(files)) {
      const formData = new FormData();
      formData.append('file', file);
      try {
        const response = await fetch('/api/upload', { method: 'POST', body: formData });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);
        setContent(prev => `${prev}\n\n![${data.filename}](${data.url})`);
      } catch (err) {
        setError(err instanceof Error ? err.message : '파일 업로드 실패');
      }
    }
    setIsUploading(false);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!title || !content || !thumbnailUrl) {
      setError('제목, 내용, 대표 이미지를 모두 설정해주세요.');
      return;
    }
    setIsSubmitting(true);
    setError('');
    setGeneratedLink('');

    try {
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          title, 
          content, 
          thumbnailUrl,
          isThumbnailBlurred: isBlurred,
          isContentSpoiler: isSpoiler,
          isNsfw, // isNsfw 데이터 전송
          selectedFont,
          password,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      setGeneratedLink(data.url);
      setTitle('');
      setContent('');
      setThumbnailUrl('');
      setIsBlurred(false);
      setIsSpoiler(false);
      setIsNsfw(false); // isNsfw 상태 초기화
      setPassword('');

    } catch (err) {
      setError(err instanceof Error ? err.message : '게시물 생성 실패');
    } finally {
      setIsSubmitting(false);
    }
  };

  const insertSpoilerText = () => {
    const textarea = contentRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    const spoilerText = `블러[${selectedText || '가릴 내용'}]`;

    const newContent = content.substring(0, start) + spoilerText + content.substring(end);
    setContent(newContent);

    textarea.focus();
    setTimeout(() => {
      const newCursorPosition = start + spoilerText.length - (selectedText ? 1 : 6);
      textarea.setSelectionRange(newCursorPosition, newCursorPosition);
    }, 0);
  };

  return (
    <main className={`flex min-h-screen flex-col items-center justify-center p-4 sm:p-8 bg-gray-100 ${selectedFont}`}>
      <div className="w-full max-w-3xl p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-center text-gray-900">새 게시물 작성</h1>
        
        <div>
          <label htmlFor="font-select" className="block text-sm font-medium text-gray-700">폰트 선택</label>
          <select id="font-select" value={selectedFont} onChange={(e) => setSelectedFont(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm">
            {Object.entries(fontClasses).map(([className, name]) => ( <option key={className} value={className}>{name}</option>))}
          </select>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div><label htmlFor="title" className="block text-sm font-medium text-gray-700">제목</label><input id="title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-gray-500 focus:border-gray-500" required /></div>
          
          <div>
            <label htmlFor="thumbnail-upload" className="block text-sm font-medium text-gray-700">대표 이미지 (SNS 미리보기에 사용)</label>
            <input id="thumbnail-upload" type="file" accept="image/*" onChange={handleThumbnailUpload} disabled={isThumbnailUploading} className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gray-100 file:text-gray-800 hover:file:bg-gray-200" />
            {isThumbnailUploading && <p className="text-sm text-gray-500 mt-2">대표 이미지 업로드 중...</p>}
            {thumbnailUrl && (
              <div className="mt-4 relative w-full aspect-video rounded-lg overflow-hidden border">
                <Image src={thumbnailUrl} alt="대표 이미지 미리보기" fill className="object-cover" />
              </div>
            )}
          </div>
          
          <div><label htmlFor="file" className="block text-sm font-medium text-gray-700">본문 이미지 (여러 개 선택 가능)</label><input id="file" type="file" multiple onChange={handleFileChange} disabled={isUploading} className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gray-100 file:text-gray-800 hover:file:bg-gray-200" />{isUploading && <p className="text-sm text-gray-500 mt-2">업로드 중...</p>}</div>
          
          <div>
            <div className="flex justify-between items-center">
              <label htmlFor="content" className="block text-sm font-medium text-gray-700">본문 (Markdown 지원)</label>
              <button type="button" onClick={insertSpoilerText} className="px-2 py-1 text-xs font-semibold text-white bg-gray-700 rounded-md hover:bg-gray-800">
                스포일러 추가
              </button>
            </div>
            <textarea 
              ref={contentRef}
              id="content" 
              rows={10} 
              value={content} 
              onChange={(e) => setContent(e.target.value)} 
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-gray-500 focus:border-gray-500" 
              required 
            />
          </div>
          
          <div className="space-y-4 rounded-md border border-gray-200 p-4">
            <h3 className="text-sm font-medium text-gray-900">옵션</h3>
            <div className="relative flex items-start">
              <div className="flex h-6 items-center"><input id="blur-toggle" type="checkbox" checked={isBlurred} onChange={(e) => setIsBlurred(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-gray-700 focus:ring-gray-600" /></div>
              <div className="ml-3 text-sm leading-6"><label htmlFor="blur-toggle" className="font-medium text-gray-700">대표 이미지 흐리게 처리</label><p className="text-gray-500">SNS 공유 시 썸네일을 블러 처리하여 가립니다.</p></div>
            </div>
            <div className="relative flex items-start">
              <div className="flex h-6 items-center"><input id="spoiler-toggle" type="checkbox" checked={isSpoiler} onChange={(e) => setIsSpoiler(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-gray-700 focus:ring-gray-600" /></div>
              <div className="ml-3 text-sm leading-6"><label htmlFor="spoiler-toggle" className="font-medium text-gray-700">본문 내용 스포일러 처리</label><p className="text-gray-500">SNS 공유 시 본문 내용을 가립니다.</p></div>
            </div>
            <div className="relative flex items-start">
              <div className="flex h-6 items-center"><input id="nsfw-toggle" type="checkbox" checked={isNsfw} onChange={(e) => setIsNsfw(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-gray-700 focus:ring-gray-600" /></div>
              <div className="ml-3 text-sm leading-6"><label htmlFor="nsfw-toggle" className="font-medium text-gray-700">NSFW (민감한 콘텐츠)</label><p className="text-gray-500">SNS 공유 시 썸네일을 완전히 가립니다.</p></div>
            </div>
             <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">비밀번호 설정 (선택 사항)</label>
              <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-gray-500 focus:border-gray-500" placeholder="비밀번호를 입력하면 게시물이 보호됩니다."/>
            </div>
          </div>

          <button type="submit" disabled={isSubmitting || isUploading || isThumbnailUploading} className="w-full px-4 py-2 text-lg font-medium text-white bg-gray-800 rounded-md hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:bg-gray-400">
            {isSubmitting ? '생성 중...' : '공유 링크 생성'}
          </button>
        </form>

        {error && <p className="mt-4 text-sm text-center text-red-600">{error}</p>}
        {generatedLink && (
          <div className="mt-6 p-4 bg-gray-100 border border-gray-200 rounded-md">
            <p className="text-sm font-medium text-gray-800">✅ 성공! 생성된 링크:</p>
            <a href={generatedLink} target="_blank" rel="noopener noreferrer" className="block mt-1 text-sm text-gray-900 font-semibold break-all hover:underline">{generatedLink}</a>
          </div>
        )}
      </div>
    </main>
  );
}