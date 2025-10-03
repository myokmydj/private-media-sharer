// app/[locale]/upload/page.tsx (덮어쓰기)
'use client';

import { useState, ChangeEvent, FormEvent, useRef } from 'react';
import { useRouter } from 'next/navigation';
import OgPreview from './OgPreview';
import ContentPreview from './ContentPreview';
import { FastAverageColor } from 'fast-average-color';
import EditorToolbar from '@/components/EditorToolbar';

function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export default function UploadPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [tags, setTags] = useState('');
  const [content, setContent] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState<string>('');
  const [isThumbnailUploading, setIsThumbnailUploading] = useState(false);
  const [isBlurred, setIsBlurred] = useState(false);
  const [isSpoiler, setIsSpoiler] = useState(false);
  const [isNsfw, setIsNsfw] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generatedLink, setGeneratedLink] = useState('');
  const [error, setError] = useState('');
  const [selectedFont, setSelectedFont] = useState('font-freesentation');
  const [ogFont, setOgFont] = useState('Pretendard');
  const [password, setPassword] = useState('');
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const [dominantColor, setDominantColor] = useState<string | null>(null);
  const [textColor, setTextColor] = useState<string | null>(null);
  const [visibility, setVisibility] = useState('public');
  // ▼▼▼ [수정] letterSpacing 상태 초기값을 '0'으로 변경합니다. ▼▼▼
  const [letterSpacing, setLetterSpacing] = useState('0');
  const [lineHeight, setLineHeight] = useState('1.75');

  const fontClasses: { [key: string]: { name: string, value: string } } = {
    'font-freesentation': { name: '프리젠테이션', value: 'Freesentation'},
    'font-pretendard': { name: '프리텐다드', value: 'Pretendard' },
    'font-bookkmyungjo': { name: '부크크 명조', value: 'BookkMyungjo' },
    'font-paperozi': { name: '페이퍼로지', value: 'Paperozi' },
  };
  
  const inputStyle = "block w-full text-sm px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-gray-400";
  const fileInputStyle = "block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gray-100 file:text-gray-800 hover:file:bg-gray-200";

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
      const fac = new FastAverageColor();
      const colorResult = await fac.getColorAsync(data.url);
      if (!colorResult.error) {
        setDominantColor(colorResult.hex);
        setTextColor(colorResult.isDark ? '#ffffff' : '#000000');
      }
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
    if (visibility === 'password' && !password) {
      setError('비밀번호 공개를 선택한 경우, 비밀번호를 입력해야 합니다.');
      return;
    }
    setIsSubmitting(true);
    setError('');
    setGeneratedLink('');
    try {
      // ▼▼▼ [추가] API 전송 전에 letterSpacing 값을 변환합니다. ▼▼▼
      const finalLetterSpacing = letterSpacing === '0' ? 'normal' : `${letterSpacing}em`;

      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          title, tags, content, thumbnailUrl,
          isThumbnailBlurred: isBlurred, isContentSpoiler: isSpoiler, isNsfw, 
          selectedFont, password, dominantColor: dominantColor || '#28234D', 
          // ▼▼▼ [수정] letterSpacing을 finalLetterSpacing으로 변경합니다. ▼▼▼
          textColor: textColor || '#FFFFFF', visibility, letterSpacing: finalLetterSpacing, lineHeight, ogFont,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setGeneratedLink(data.url);
      setTitle(''); setTags(''); setContent(''); setThumbnailUrl('');
      setIsBlurred(false); setIsSpoiler(false); setIsNsfw(false); setPassword('');
      setDominantColor(null); setTextColor(null); setVisibility('public');
      // ▼▼▼ [수정] 폼 리셋 시 letterSpacing 값을 '0'으로 설정합니다. ▼▼▼
      setLetterSpacing('0'); setLineHeight('1.75'); setOgFont('Pretendard');
    } catch (err) {
      setError(err instanceof Error ? err.message : '게시물 생성 실패');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleImageResize = (src: string, newWidth: number) => {
    setContent(currentContent => {
      const escapedSrc = escapeRegExp(src);
      const htmlImgRegex = new RegExp(`<img[^>]*src="(${escapedSrc})"[^>]*>`, 'i');
      if (htmlImgRegex.test(currentContent)) {
        return currentContent.replace(htmlImgRegex, (match) => {
          if (/width="/i.test(match)) { return match.replace(/width="\d+"/i, `width="${newWidth}"`); }
          else { return match.replace(/<img/i, `<img width="${newWidth}"`); }
        });
      }
      const markdownImgRegex = new RegExp(`!\\[([^\\]]*)\\]\\((${escapedSrc})\\)`, 'g');
      if (markdownImgRegex.test(currentContent)) {
        return currentContent.replace(markdownImgRegex, `<img alt="$1" src="${src}" width="${newWidth}" />`);
      }
      return currentContent;
    });
  };

  return (
    <main className={`min-h-screen p-4 sm:p-8`}>
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 sm:p-8 rounded-xl border border-gray-200 space-y-6 h-fit">
          <h1 className="text-2xl font-black text-center text-gray-900">새 게시물 작성</h1>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div><label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">제목</label><input id="title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} className={inputStyle} required /></div>
            <div><label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">태그</label><input id="tags" type="text" value={tags} onChange={(e) => setTags(e.target.value)} className={inputStyle} placeholder="쉼표(,)로 구분" /></div>
            <div><label htmlFor="thumbnail-upload" className="block text-sm font-medium text-gray-700 mb-1">대표 이미지</label><input id="thumbnail-upload" type="file" accept="image/*" onChange={handleThumbnailUpload} disabled={isThumbnailUploading} className={fileInputStyle} required />{isThumbnailUploading && <p className="text-xs text-gray-500 mt-2">대표 이미지 업로드 및 분석 중...</p>}</div>
            <div><label htmlFor="file" className="block text-sm font-medium text-gray-700 mb-1">본문 이미지</label><input id="file" type="file" multiple onChange={handleFileChange} disabled={isUploading} className={fileInputStyle} />{isUploading && <p className="text-xs text-gray-500 mt-2">업로드 중...</p>}</div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">본문</label>
              <EditorToolbar textareaRef={contentRef} setContent={setContent} />
              <textarea ref={contentRef} id="content" rows={12} value={content} onChange={(e) => setContent(e.target.value)} className={`${inputStyle} rounded-t-none`} required />
            </div>

            <div className="space-y-4 rounded-md border border-gray-200 p-4">
              <h3 className="text-sm font-black text-gray-900">본문 스타일</h3>
              {/* ▼▼▼ [수정] 자간 조절 UI 추가 및 레이아웃 변경 ▼▼▼ */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                <div className="sm:col-span-2">
                  <label htmlFor="font" className="block text-sm font-medium text-gray-700 mb-1">본문 폰트</label>
                  <select id="font" value={selectedFont} onChange={(e) => setSelectedFont(e.target.value)} className={`${inputStyle} text-sm`}>
                    {Object.entries(fontClasses).map(([className, {name}]) => (
                      <option key={className} value={className}>{name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="letterSpacing" className="block text-sm font-medium text-gray-700 mb-1">자간: {letterSpacing}em</label>
                  <input id="letterSpacing" type="range" min="-0.05" max="0.1" step="0.025" value={letterSpacing} onChange={e => setLetterSpacing(e.target.value)} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"/>
                </div>
                <div>
                  <label htmlFor="lineHeight" className="block text-sm font-medium text-gray-700 mb-1">행간: {lineHeight}</label>
                  <input id="lineHeight" type="range" min="1.25" max="2.5" step="0.25" value={lineHeight} onChange={e => setLineHeight(e.target.value)} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"/>
                </div>
              </div>
              {/* ▲▲▲ 여기까지 수정 ▲▲▲ */}
            </div>

            <div className="space-y-6 rounded-md border border-gray-200 p-4">
              <h3 className="text-sm font-black text-gray-900">공개 및 SNS 옵션</h3>
              <div>
                <label htmlFor="ogFont" className="block text-sm font-medium text-gray-700 mb-1">SNS 미리보기 폰트</label>
                <select id="ogFont" value={ogFont} onChange={(e) => setOgFont(e.target.value)} className={`${inputStyle} text-sm`}>
                  {Object.entries(fontClasses).map(([_, {name, value}]) => (
                    <option key={value} value={value}>{name}</option>
                  ))}
                </select>
              </div>
              <div>
                <h4 className="block text-sm font-medium text-gray-700 mb-2">공개 범위</h4>
                <div className="flex flex-wrap gap-x-6 gap-y-2">
                  <label className="flex items-center space-x-2"><input type="radio" name="visibility" value="public" checked={visibility === 'public'} onChange={(e) => setVisibility(e.target.value)} className="h-4 w-4" /> <span className="text-sm">전체 공개</span></label>
                  <label className="flex items-center space-x-2"><input type="radio" name="visibility" value="password" checked={visibility === 'password'} onChange={(e) => setVisibility(e.target.value)} className="h-4 w-4" /> <span className="text-sm">비밀번호</span></label>
                  <label className="flex items-center space-x-2"><input type="radio" name="visibility" value="followers_only" checked={visibility === 'followers_only'} onChange={(e) => setVisibility(e.target.value)} className="h-4 w-4" /> <span className="text-sm">팔로워만</span></label>
                  <label className="flex items-center space-x-2"><input type="radio" name="visibility" value="mutuals_only" checked={visibility === 'mutuals_only'} onChange={(e) => setVisibility(e.target.value)} className="h-4 w-4" /> <span className="text-sm">맞팔로워만</span></label>
                </div>
              </div>
              {visibility === 'password' && (
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">비밀번호</label>
                  <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className={inputStyle} placeholder="게시물 보호용 비밀번호" required />
                </div>
              )}
              <div>
                <h4 className="block text-sm font-medium text-gray-700 mt-4 mb-2">SNS 미리보기 옵션</h4>
                <div className="space-y-2">
                  <div className="relative flex items-start"><div className="flex h-6 items-center"><input id="blur-toggle" type="checkbox" checked={isBlurred} onChange={(e) => setIsBlurred(e.target.checked)} className="h-4 w-4 rounded border-gray-300" /></div><div className="ml-3 text-sm leading-6"><label htmlFor="blur-toggle" className="font-medium text-gray-700">대표 이미지 흐리게</label></div></div>
                  <div className="relative flex items-start"><div className="flex h-6 items-center"><input id="spoiler-toggle" type="checkbox" checked={isSpoiler} onChange={(e) => setIsSpoiler(e.target.checked)} className="h-4 w-4 rounded border-gray-300" /></div><div className="ml-3 text-sm leading-6"><label htmlFor="spoiler-toggle" className="font-medium text-gray-700">본문 내용 스포일러</label></div></div>
                  <div className="relative flex items-start"><div className="flex h-6 items-center"><input id="nsfw-toggle" type="checkbox" checked={isNsfw} onChange={(e) => setIsNsfw(e.target.checked)} className="h-4 w-4 rounded border-gray-300" /></div><div className="ml-3 text-sm leading-6"><label htmlFor="nsfw-toggle" className="font-medium text-gray-700">NSFW (민감한 콘텐츠)</label></div></div>
                </div>
              </div>
            </div>
            
            <button type="submit" disabled={isSubmitting || isUploading || isThumbnailUploading} className="w-full px-4 py-2.5 text-base font-semibold text-white bg-gray-800 rounded-md hover:bg-gray-900 disabled:bg-gray-400">{isSubmitting ? '생성 중...' : '공유 링크 생성'}</button>
          </form>
          {error && <p className="mt-4 text-sm text-center text-red-600">{error}</p>}
          {generatedLink && (<div className="mt-6 p-4 bg-gray-100 border border-gray-200 rounded-md"><p className="text-sm font-medium text-gray-800">✅ 성공! 생성된 링크:</p><a href={generatedLink} target="_blank" rel="noopener noreferrer" className="block mt-1 text-sm text-gray-900 font-semibold break-all hover:underline">{generatedLink}</a></div>)}
        </div>
        <div className="space-y-8 sticky top-8 h-fit">
          <OgPreview 
            title={title} 
            tags={tags} 
            content={content} 
            imageUrl={thumbnailUrl} 
            isBlurred={isBlurred} 
            isSpoiler={isSpoiler} 
            isNsfw={isNsfw} 
            ogFont={ogFont}
            dominantColor={dominantColor}
            textColor={textColor}
          />
          {/* ▼▼▼ 바로 이 부분에 letterSpacing과 lineHeight props를 추가합니다. ▼▼▼ */}
          <ContentPreview 
            content={content} 
            fontClass={selectedFont} 
            onImageResize={handleImageResize}
            letterSpacing={letterSpacing}
            lineHeight={lineHeight}
          />
          {/* ▲▲▲ 여기까지 수정 ▲▲▲ */}
        </div>
      </div>
    </main>
  );
}