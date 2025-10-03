// components/ProfileHeaderUploader.tsx
'use client';

import { useState, useRef, ChangeEvent } from 'react';
import { Camera } from 'lucide-react';

interface ProfileHeaderUploaderProps {
  currentImageUrl: string | null;
  onUploadComplete: () => void;
}

export default function ProfileHeaderUploader({
  currentImageUrl,
  onUploadComplete,
}: ProfileHeaderUploaderProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);
      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const uploadData = await uploadResponse.json();
      if (!uploadResponse.ok) throw new Error(uploadData.error || '이미지 업로드 실패');

      const updateResponse = await fetch('/api/profile/update-header', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl: uploadData.url }),
      });
      if (!updateResponse.ok) throw new Error('헤더 이미지 업데이트 실패');
      
      onUploadComplete();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      className="relative w-full h-48 bg-cover bg-center rounded-t-xl group"
      style={{ backgroundImage: `url(${currentImageUrl || '/default-header.png'})` }}
    >
      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={isLoading}
        className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
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
      {error && <p className="absolute bottom-2 left-2 text-xs text-red-300 bg-black/50 p-1 rounded">{error}</p>}
    </div>
  );
}