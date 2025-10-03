'use client';

import { useState, ChangeEvent, FormEvent } from 'react';
import Image from 'next/image';

interface UploadedImage {
  url: string;
  filename: string;
}

export default function UploadPage() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [selectedThumbnail, setSelectedThumbnail] = useState<string>('');
  
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generatedLink, setGeneratedLink] = useState('');
  const [error, setError] = useState('');

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setError('');

    for (const file of Array.from(files)) {
      const formData = new FormData();
      formData.append('file', file);

      try {
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);

        // 본문에 이미지 마크다운 추가
        setContent(prev => `${prev}\n\n![${data.filename}](${data.url})`);
        
        // 업로드된 이미지 목록에 추가
        setUploadedImages(prev => [...prev, { url: data.url, filename: data.filename }]);

        // 첫 번째 업로드된 이미지를 기본 대표 이미지로 설정
        if (!selectedThumbnail) {
          setSelectedThumbnail(data.url);
        }

      } catch (err) {
        setError(err instanceof Error ? err.message : '파일 업로드 실패');
      }
    }
    setIsUploading(false);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!title || !content || !selectedThumbnail) {
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
        body: JSON.stringify({ title, content, thumbnailUrl: selectedThumbnail }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      setGeneratedLink(data.url);
      // 성공 시 폼 초기화
      setTitle('');
      setContent('');
      setUploadedImages([]);
      setSelectedThumbnail('');

    } catch (err) {
      setError(err instanceof Error ? err.message : '게시물 생성 실패');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-8 bg-gray-50">
      <div className="w-full max-w-3xl p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-center text-gray-800">새 게시물 작성</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 제목 입력 */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">제목</label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="게시물 제목을 입력하세요"
              required
            />
          </div>

          {/* 파일 업로드 */}
          <div>
            <label htmlFor="file" className="block text-sm font-medium text-gray-700">이미지 업로드 (여러 개 선택 가능)</label>
            <input
              id="file"
              type="file"
              multiple
              onChange={handleFileChange}
              disabled={isUploading}
              className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
            />
            {isUploading && <p className="text-sm text-gray-500 mt-2">업로드 중...</p>}
          </div>

          {/* 본문 입력 */}
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700">본문 (Markdown 지원)</label>
            <textarea
              id="content"
              rows={10}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="내용을 입력하세요. 이미지 업로드 시 자동으로 추가됩니다."
              required
            />
          </div>

          {/* 대표 이미지 선택 */}
          {uploadedImages.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-700">대표 이미지 선택 (SNS 미리보기에 사용)</h3>
              <div className="mt-2 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                {uploadedImages.map((image) => (
                  <div key={image.url} className="relative aspect-square cursor-pointer" onClick={() => setSelectedThumbnail(image.url)}>
                    <Image
                      src={image.url}
                      alt={image.filename}
                      fill
                      className={`object-cover rounded-md transition-all ${selectedThumbnail === image.url ? 'ring-4 ring-indigo-500' : 'ring-1 ring-gray-300'}`}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 제출 버튼 */}
          <button
            type="submit"
            disabled={isSubmitting || isUploading}
            className="w-full px-4 py-2 text-lg font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400"
          >
            {isSubmitting ? '생성 중...' : '공유 링크 생성'}
          </button>
        </form>

        {error && <p className="mt-4 text-sm text-center text-red-600">{error}</p>}
        {generatedLink && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-md">
            <p className="text-sm font-medium text-green-800">✅ 성공! 생성된 링크:</p>
            <a href={generatedLink} target="_blank" rel="noopener noreferrer" className="block mt-1 text-sm text-blue-600 break-all hover:underline">
              {generatedLink}
            </a>
          </div>
        )}
      </div>
    </main>
  );
}