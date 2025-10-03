// components/FollowButton.tsx (전체 코드)
'use client';

import { useState, useTransition } from 'react';
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
  const [isPending, startTransition] = useTransition();

  const isLoading = status === 'loading' || isPending;

  if (status === 'unauthenticated') {
    return (
      <button onClick={() => router.push('/login')} className="px-4 py-1.5 text-sm font-semibold rounded-full bg-gray-900 text-white hover:bg-gray-700">
        Follow
      </button>
    );
  }

  if (!session || session.user.id === String(targetUserId)) {
    return null; // 자기 자신 프로필에선 안 보임
  }

  const handleClick = async () => {
    const action = isFollowing ? 'unfollow' : 'follow';
    try {
      const res = await fetch(`/api/users/${targetUserId}/follow`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      if (res.ok) {
        setIsFollowing(!isFollowing);
        startTransition(() => {
          router.refresh(); // 서버 데이터를 다시 불러와 팔로워 수 등을 갱신
        });
      } else {
        console.error('Follow action failed');
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      className={`w-28 px-4 py-1.5 text-sm font-semibold rounded-full transition-colors disabled:opacity-50 ${
        isFollowing
          ? 'bg-white text-gray-800 border border-gray-300 hover:bg-gray-100'
          : 'bg-gray-900 text-white hover:bg-gray-700'
      }`}
    >
      {isLoading ? '...' : isFollowing ? 'Following' : 'Follow'}
    </button>
  );
}