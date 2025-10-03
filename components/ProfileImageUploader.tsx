// components/ProfileImageUploader.tsx (새 파일)
'use client';

import { useState, useRef, ChangeEvent } from 'react';
import Image from 'next/image';
import { Camera } from 'lucide-react';

interface ProfileImageUploaderProps {
  currentImageUrl: string | null;
  onUploadComplete: () => void;
}

export default function ProfileImageUploader({
  currentImageUrl,
  onUploadComplete,
}: ProfileImageUploaderProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setError('');

    try {
      // 1. 이미지 R2에 업로드
      const formData = new FormData();
      formData.append('file', file);
      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const uploadData = await uploadResponse.json();
      if (!uploadResponse.ok) throw new Error(uploadData.error || '이미지 업로드 실패');

      // 2. DB에 이미지 URL 업데이트
      const updateResponse = await fetch('/api/profile/update-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl: uploadData.url }),
      });
      if (!updateResponse.ok) throw new Error('프로필 이미지 업데이트 실패');
      
      onUploadComplete();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative w-24 h-24 group">
      <div className="relative w-24 h-24 rounded-full overflow-hidden bg-gray-300">
        <Image
          src={currentImageUrl || '/default-avatar.png'}
          alt="Profile"
          fill
          className="object-cover"
          sizes="96px"
        />
      </div>
      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={isLoading}
        className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
      >
        {isLoading ? (
          <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        ) : (
          <Camera size={24} />
        )}
      </button>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/png, image/jpeg, image/gif"
        className="hidden"
      />
      {error && <p className="text-xs text-red-500 mt-1 absolute">{error}</p>}
    </div>
  );
}