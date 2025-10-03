// app/[locale]/edit/[id]/page.tsx

'use client';

import { useState, useEffect, FormEvent, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import OgPreview from '@/app/[locale]/upload/OgPreview';
import ContentPreview from '@/app/[locale]/upload/ContentPreview';
import { FastAverageColor } from 'fast-average-color';
import type { Post } from '@/types';

function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Post 타입에 visibility 속성 추가 필요 (types/index.ts)
interface EditablePost extends Post {
  visibility?: string;
}

export default function EditPage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params;

  const [post, setPost] = useState<EditablePost | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Form states
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
  const [selectedFont, setSelectedFont] = useState('font-pretendard');
  const [password, setPassword] = useState('');
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const [dominantColor, setDominantColor] = useState<string | null>(null);
  const [textColor, setTextColor] = useState<string | null>(null);

  // ▼▼▼ [수정] 공개 범위 상태 추가 ▼▼▼
  const [visibility, setVisibility] = useState('public');

  useEffect(() => {
    if (!id) return;

    const fetchPost = async () => {
      try {
        const res = await fetch(`/api/posts/${id}`);
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || '게시물을 불러오는데 실패했습니다.');
        }
        const data: EditablePost = await res.json();
        
        // 폼 상태를 불러온 데이터로 채우기
        setPost(data);
        setTitle(data.title);
        setTags(data.tags || '');
        setContent(data.content);
        setThumbnailUrl(data.thumbnail_url);
        setIsBlurred(data.is_thumbnail_blurred);
        setIsSpoiler(data.is_content_spoiler);
        setIsNsfw(data.is_nsfw);
        setSelectedFont(data.font_family || 'font-pretendard');
        setDominantColor(data.dominant_color);
        setTextColor(data.text_color);
        setVisibility(data.visibility || 'public'); // ▼▼▼ [수정] 공개 범위 설정 ▼▼▼
      } catch (err: any) {
        setError(err.message);
        if (err.message.includes('권한')) {
          setTimeout(() => router.push('/my-posts'), 2000);
        }
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchPost();
  }, [id, router]);

  const handleThumbnailUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
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

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!title || !content || !thumbnailUrl) {
      setError('제목, 내용, 대표 이미지를 모두 설정해주세요.');
      return;
    }
    // 수정 페이지에서는 비밀번호가 없어도 제출 가능 (유지)
    // 단, 비밀번호 공개인데 빈 칸이면 막아야 함
    if (visibility === 'password' && !post?.password && !password) {
      setError('비밀번호 공개를 선택한 경우, 새 비밀번호를 입력해야 합니다.');
      return;
    }

    setIsSubmitting(true);
    setError('');
    setGeneratedLink('');

    try {
      const response = await fetch(`/api/posts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title, tags, content, thumbnailUrl,
          isThumbnailBlurred: isBlurred,
          isContentSpoiler: isSpoiler,
          isNsfw, selectedFont, password,
          dominantColor: dominantColor || '#28234D',
          textColor: textColor || '#FFFFFF',
          visibility, // ▼▼▼ [수정] 공개 범위 값 추가 ▼▼▼
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      setGeneratedLink(data.url);
      alert('게시물이 성공적으로 수정되었습니다.');
      router.push('/my-posts');
    } catch (err) {
      setError(err instanceof Error ? err.message : '게시물 수정 실패');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // insertSpoilerText, handleImageResize, handleFileChange 함수는 upload 페이지와 동일...

  if (isLoadingData) {
    return <div className="min-h-screen flex items-center justify-center">데이터를 불러오는 중...</div>;
  }
  if (!post) {
    return <div className="min-h-screen flex items-center justify-center text-red-500">{error || '게시물을 찾을 수 없습니다.'}</div>;
  }

  return (
    <main className={`min-h-screen bg-gray-100 p-4 sm:p-8 ${selectedFont}`}>
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-lg shadow-md space-y-6 h-fit">
          <h1 className="text-3xl font-bold text-center text-gray-900">게시물 수정</h1>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 제목, 태그, 이미지 업로드 등 기존 UI (upload 페이지와 동일) ... */}
            <div><label htmlFor="title" className="block text-sm font-medium text-gray-700">제목</label><input id="title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-gray-500 focus:border-gray-500" required /></div>
            <div><label htmlFor="tags" className="block text-sm font-medium text-gray-700">태그</label><input id="tags" type="text" value={tags} onChange={(e) => setTags(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-gray-500 focus:border-gray-500" placeholder="태그를 쉼표(,)로 구분하여 입력" /></div>
            <div><label htmlFor="thumbnail-upload" className="block text-sm font-medium text-gray-700">대표 이미지</label><input id="thumbnail-upload" type="file" accept="image/*" onChange={handleThumbnailUpload} disabled={isThumbnailUploading} className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gray-100 file:text-gray-800 hover:file:bg-gray-200" />{isThumbnailUploading && <p className="text-sm text-gray-500 mt-2">대표 이미지 업로드 및 분석 중...</p>}</div>
            <div><label htmlFor="content" className="block text-sm font-medium text-gray-700">본문</label><textarea id="content" rows={10} value={content} onChange={(e) => setContent(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" required /></div>
            
            {/* ▼▼▼ [수정] 공개 범위 및 옵션 섹션 (upload 페이지와 동일) ▼▼▼ */}
            <div className="space-y-6 rounded-md border border-gray-200 p-4">
              <div>
                <h3 className="text-sm font-medium text-gray-900">공개 범위</h3>
                <div className="mt-2 flex flex-wrap gap-x-6 gap-y-2">
                  <label className="flex items-center space-x-2"><input type="radio" name="visibility" value="public" checked={visibility === 'public'} onChange={(e) => setVisibility(e.target.value)} className="h-4 w-4" /> <span className="text-sm">전체 공개</span></label>
                  <label className="flex items-center space-x-2"><input type="radio" name="visibility" value="password" checked={visibility === 'password'} onChange={(e) => setVisibility(e.target.value)} className="h-4 w-4" /> <span className="text-sm">비밀번호</span></label>
                  <label className="flex items-center space-x-2"><input type="radio" name="visibility" value="followers_only" checked={visibility === 'followers_only'} onChange={(e) => setVisibility(e.target.value)} className="h-4 w-4" /> <span className="text-sm">팔로워만</span></label>
                  <label className="flex items-center space-x-2"><input type="radio" name="visibility" value="mutuals_only" checked={visibility === 'mutuals_only'} onChange={(e) => setVisibility(e.target.value)} className="h-4 w-4" /> <span className="text-sm">맞팔로워만</span></label>
                </div>
              </div>

              {(visibility === 'password') && (
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">비밀번호 (변경 시에만 입력)</label>
                  <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" placeholder="새 비밀번호 또는 빈 칸으로 두기" />
                </div>
              )}

              <div>
                <h3 className="text-sm font-medium text-gray-900">SNS 미리보기 옵션</h3>
                {/* ... 체크박스들 ... */}
              </div>
            </div>

            <button type="submit" disabled={isSubmitting || isUploading || isThumbnailUploading} className="w-full px-4 py-2 text-lg font-medium text-white bg-gray-800 rounded-md hover:bg-gray-900 disabled:bg-gray-400">{isSubmitting ? '수정 중...' : '수정 완료'}</button>
          </form>
          {error && <p className="mt-4 text-sm text-center text-red-600">{error}</p>}
          {generatedLink && (<div className="mt-6 p-4 bg-gray-100 rounded-md"><p className="text-sm font-medium">✅ 수정 성공! 공유 링크:</p><a href={generatedLink} target="_blank" rel="noopener noreferrer" className="block mt-1 text-sm font-semibold break-all hover:underline">{generatedLink}</a></div>)}
        </div>
        <div className="space-y-8 sticky top-8 h-fit">
          <OgPreview title={title} tags={tags} content={content} imageUrl={thumbnailUrl} isBlurred={isBlurred} isSpoiler={isSpoiler} isNsfw={isNsfw} />
          <ContentPreview content={content} fontClass={selectedFont} onImageResize={() => {}} />
        </div>
      </div>
    </main>
  );
}