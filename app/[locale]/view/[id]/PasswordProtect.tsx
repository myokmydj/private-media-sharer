'use client';

import { useState, FormEvent } from 'react';
import PostContent from './PostContent';
import type { Post } from '@/types'; // Post 타입을 import 합니다.

// Post 인터페이스를 여기서 제거합니다.

export default function PasswordProtect({ post }: { post: Post }) {
  // ... 나머지 코드는 동일 ...
  const [isVerified, setIsVerified] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/verify-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: post.id, password: passwordInput }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setIsVerified(true);
      } else {
        setError(data.error || '인증에 실패했습니다.');
      }
    } catch (err) {
      setError('네트워크 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isVerified) {
    return <PostContent post={post} />;
  }

  return (
    <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-center text-gray-800">비밀번호 필요</h2>
      <p className="text-center text-sm text-gray-600">이 콘텐츠를 보려면 비밀번호를 입력하세요.</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="password-input" className="sr-only">비밀번호</label>
          <input
            id="password-input"
            type="password"
            value={passwordInput}
            onChange={(e) => setPasswordInput(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-gray-500 focus:border-gray-500"
            placeholder="비밀번호"
            required
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full px-4 py-2 font-medium text-white bg-gray-800 rounded-md hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:bg-gray-400"
        >
          {isLoading ? '확인 중...' : '확인'}
        </button>
      </form>
    </div>
  );
}