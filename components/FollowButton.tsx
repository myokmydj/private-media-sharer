// components/FollowButton.tsx
'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface FollowButtonProps {
  targetUserId: number;
  isInitiallyFollowing: boolean;
}

export default function FollowButton({ targetUserId, isInitiallyFollowing }: FollowButtonProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isFollowing, setIsFollowing] = useState(isInitiallyFollowing);
  const [isLoading, setIsLoading] = useState(false);

  if (status === 'loading') return <div className="h-9 w-20 rounded-md bg-gray-200 animate-pulse" />;
  if (!session) return null; // 로그인 안 한 유저는 버튼 안 보임
  if (session.user.id === String(targetUserId)) return null; // 자기 자신 프로필에선 안 보임

  const handleClick = async () => {
    setIsLoading(true);
    const action = isFollowing ? 'unfollow' : 'follow';
    try {
      const res = await fetch(`/api/users/${targetUserId}/follow`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      if (res.ok) {
        setIsFollowing(!isFollowing);
        router.refresh(); // 서버 데이터를 다시 불러와 팔로워 수 등을 갱신
      } else {
        console.error('Follow action failed');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      className={`px-4 py-1.5 text-sm font-semibold rounded-full transition-colors disabled:opacity-50 ${
        isFollowing
          ? 'bg-white text-gray-800 border border-gray-300 hover:bg-gray-100'
          : 'bg-gray-900 text-white hover:bg-gray-700'
      }`}
    >
      {isLoading ? '...' : isFollowing ? '팔로잉' : '팔로우'}
    </button>
  );
}